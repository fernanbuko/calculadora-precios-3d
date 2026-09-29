// CSG (constructive solid geometry) — BSP-tree boolean operations
// (union/subtract/intersect) on THREE.js meshes.
//
// Empaquetado a mano a partir de "three-csg-ts" (MIT, https://github.com/samalexander/three-csg-ts,
// puerto TypeScript del "csg.js" clásico de Evan Wallace) en un solo
// archivo sin módulos, para poder auto-hospedarlo junto al resto de la
// app (no hay acceso a CDN) y usarlo con el THREE.js global ya cargado
// por three.min.js. Solo usa APIs de THREE estables desde hace años
// (BufferGeometry, BufferAttribute, Matrix4, Matrix3, Vector3, Mesh),
// así que funciona igual con la versión r128 que ya usa esta app.
//
// Licencia MIT (three-csg-ts, Copyright (c) 2020 Jiro Digital Ltd):
// se otorga permiso, sin cargo, para usar, copiar, modificar, fusionar,
// publicar, distribuir, sublicenciar y/o vender copias de este software,
// siempre que este aviso de copyright se incluya en todas las copias.
// El software se entrega "tal cual", sin garantía de ningún tipo.
(function(root, factory){
  root.CSG = factory(root.THREE);
})(typeof self !== 'undefined' ? self : this, function(THREE){
  'use strict';

  class Vector {
    constructor(x = 0, y = 0, z = 0){ this.x = x; this.y = y; this.z = z; }
    copy(v){ this.x = v.x; this.y = v.y; this.z = v.z; return this; }
    clone(){ return new Vector(this.x, this.y, this.z); }
    negate(){ this.x *= -1; this.y *= -1; this.z *= -1; return this; }
    add(a){ this.x += a.x; this.y += a.y; this.z += a.z; return this; }
    sub(a){ this.x -= a.x; this.y -= a.y; this.z -= a.z; return this; }
    times(a){ this.x *= a; this.y *= a; this.z *= a; return this; }
    dividedBy(a){ this.x /= a; this.y /= a; this.z /= a; return this; }
    lerp(a, t){ return this.add(new Vector().copy(a).sub(this).times(t)); }
    unit(){ return this.dividedBy(this.length()); }
    length(){ return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2); }
    normalize(){ return this.unit(); }
    cross(b){
      const a = this.clone();
      const ax = a.x, ay = a.y, az = a.z;
      const bx = b.x, by = b.y, bz = b.z;
      this.x = ay * bz - az * by;
      this.y = az * bx - ax * bz;
      this.z = ax * by - ay * bx;
      return this;
    }
    dot(b){ return this.x * b.x + this.y * b.y + this.z * b.z; }
    toVector3(){ return new THREE.Vector3(this.x, this.y, this.z); }
  }

  class Vertex {
    constructor(pos, normal, uv, color){
      this.pos = new Vector().copy(pos);
      this.normal = new Vector().copy(normal);
      this.uv = new Vector().copy(uv);
      this.uv.z = 0;
      if(color) this.color = new Vector().copy(color);
    }
    clone(){ return new Vertex(this.pos, this.normal, this.uv, this.color); }
    flip(){ this.normal.negate(); }
    interpolate(other, t){
      return new Vertex(
        this.pos.clone().lerp(other.pos, t),
        this.normal.clone().lerp(other.normal, t),
        this.uv.clone().lerp(other.uv, t),
        this.color && other.color && this.color.clone().lerp(other.color, t)
      );
    }
  }

  class Polygon {
    constructor(vertices, shared){
      this.vertices = vertices;
      this.shared = shared;
      this.plane = Plane.fromPoints(vertices[0].pos, vertices[1].pos, vertices[2].pos);
    }
    clone(){ return new Polygon(this.vertices.map(v => v.clone()), this.shared); }
    flip(){ this.vertices.reverse().map(v => v.flip()); this.plane.flip(); }
  }

  class Plane {
    constructor(normal, w){ this.normal = normal; this.w = w; }
    clone(){ return new Plane(this.normal.clone(), this.w); }
    flip(){ this.normal.negate(); this.w = -this.w; }
    splitPolygon(polygon, coplanarFront, coplanarBack, front, back){
      const COPLANAR = 0, FRONT = 1, BACK = 2, SPANNING = 3;
      let polygonType = 0;
      const types = [];
      for(let i = 0; i < polygon.vertices.length; i++){
        const t = this.normal.dot(polygon.vertices[i].pos) - this.w;
        const type = t < -Plane.EPSILON ? BACK : t > Plane.EPSILON ? FRONT : COPLANAR;
        polygonType |= type;
        types.push(type);
      }
      switch(polygonType){
        case COPLANAR:
          (this.normal.dot(polygon.plane.normal) > 0 ? coplanarFront : coplanarBack).push(polygon);
          break;
        case FRONT:
          front.push(polygon);
          break;
        case BACK:
          back.push(polygon);
          break;
        case SPANNING: {
          const f = [], b = [];
          for(let i = 0; i < polygon.vertices.length; i++){
            const j = (i + 1) % polygon.vertices.length;
            const ti = types[i], tj = types[j];
            const vi = polygon.vertices[i], vj = polygon.vertices[j];
            if(ti != BACK) f.push(vi);
            if(ti != FRONT) b.push(ti != BACK ? vi.clone() : vi);
            if((ti | tj) == SPANNING){
              const t = (this.w - this.normal.dot(vi.pos)) / this.normal.dot(new Vector().copy(vj.pos).sub(vi.pos));
              const v = vi.interpolate(vj, t);
              f.push(v);
              b.push(v.clone());
            }
          }
          if(f.length >= 3) front.push(new Polygon(f, polygon.shared));
          if(b.length >= 3) back.push(new Polygon(b, polygon.shared));
          break;
        }
      }
    }
    static fromPoints(a, b, c){
      const n = new Vector().copy(b).sub(a).cross(new Vector().copy(c).sub(a)).normalize();
      return new Plane(n.clone(), n.dot(a));
    }
  }
  Plane.EPSILON = 1e-5;

  class Node {
    constructor(polygons){
      this.plane = null; this.front = null; this.back = null; this.polygons = [];
      if(polygons) this.build(polygons);
    }
    clone(){
      const node = new Node();
      node.plane = this.plane && this.plane.clone();
      node.front = this.front && this.front.clone();
      node.back = this.back && this.back.clone();
      node.polygons = this.polygons.map(p => p.clone());
      return node;
    }
    invert(){
      for(let i = 0; i < this.polygons.length; i++) this.polygons[i].flip();
      this.plane && this.plane.flip();
      this.front && this.front.invert();
      this.back && this.back.invert();
      const temp = this.front; this.front = this.back; this.back = temp;
    }
    clipPolygons(polygons){
      if(!this.plane) return polygons.slice();
      let front = [], back = [];
      for(let i = 0; i < polygons.length; i++) this.plane.splitPolygon(polygons[i], front, back, front, back);
      if(this.front) front = this.front.clipPolygons(front);
      back = this.back ? this.back.clipPolygons(back) : [];
      return front.concat(back);
    }
    clipTo(bsp){
      this.polygons = bsp.clipPolygons(this.polygons);
      if(this.front) this.front.clipTo(bsp);
      if(this.back) this.back.clipTo(bsp);
    }
    allPolygons(){
      let polygons = this.polygons.slice();
      if(this.front) polygons = polygons.concat(this.front.allPolygons());
      if(this.back) polygons = polygons.concat(this.back.allPolygons());
      return polygons;
    }
    build(polygons){
      if(!polygons.length) return;
      if(!this.plane) this.plane = polygons[0].plane.clone();
      const front = [], back = [];
      for(let i = 0; i < polygons.length; i++) this.plane.splitPolygon(polygons[i], this.polygons, this.polygons, front, back);
      if(front.length){ if(!this.front) this.front = new Node(); this.front.build(front); }
      if(back.length){ if(!this.back) this.back = new Node(); this.back.build(back); }
    }
  }

  class NBuf3 {
    constructor(ct){ this.top = 0; this.array = new Float32Array(ct); }
    write(v){ this.array[this.top++] = v.x; this.array[this.top++] = v.y; this.array[this.top++] = v.z; }
  }
  class NBuf2 {
    constructor(ct){ this.top = 0; this.array = new Float32Array(ct); }
    write(v){ this.array[this.top++] = v.x; this.array[this.top++] = v.y; }
  }

  class CSG {
    constructor(){ this.polygons = []; }
    static fromPolygons(polygons){ const csg = new CSG(); csg.polygons = polygons; return csg; }
    static fromGeometry(geom, objectIndex){
      let polys = [];
      const posattr = geom.attributes.position;
      const normalattr = geom.attributes.normal;
      const uvattr = geom.attributes.uv;
      const colorattr = geom.attributes.color;
      const grps = geom.groups;
      let index;
      if(geom.index){ index = geom.index.array; }
      else {
        index = new Uint16Array((posattr.array.length / posattr.itemSize) | 0);
        for(let i = 0; i < index.length; i++) index[i] = i;
      }
      const triCount = (index.length / 3) | 0;
      polys = new Array(triCount);
      for(let i = 0, pli = 0, l = index.length; i < l; i += 3, pli++){
        const vertices = new Array(3);
        for(let j = 0; j < 3; j++){
          const vi = index[i + j];
          const vp = vi * 3, vt = vi * 2;
          const x = posattr.array[vp], y = posattr.array[vp + 1], z = posattr.array[vp + 2];
          const nx = normalattr.array[vp], ny = normalattr.array[vp + 1], nz = normalattr.array[vp + 2];
          const u = uvattr ? uvattr.array[vt] : undefined;
          const v = uvattr ? uvattr.array[vt + 1] : undefined;
          vertices[j] = new Vertex(
            new Vector(x, y, z), new Vector(nx, ny, nz), new Vector(u, v, 0),
            colorattr && new Vector(colorattr.array[vp], colorattr.array[vp + 1], colorattr.array[vp + 2])
          );
        }
        if(objectIndex === undefined && grps && grps.length > 0){
          for(const grp of grps){
            if(i >= grp.start && i < grp.start + grp.count) polys[pli] = new Polygon(vertices, grp.materialIndex);
          }
        } else {
          polys[pli] = new Polygon(vertices, objectIndex);
        }
      }
      return CSG.fromPolygons(polys.filter(p => p && !Number.isNaN(p.plane.normal.x)));
    }
    static toGeometry(csg, toMatrix){
      let triCount = 0;
      const ps = csg.polygons;
      for(const p of ps) triCount += p.vertices.length - 2;
      const geom = new THREE.BufferGeometry();
      const vertices = new NBuf3(triCount * 3 * 3);
      const normals = new NBuf3(triCount * 3 * 3);
      const uvs = new NBuf2(triCount * 2 * 3);
      let colors;
      const grps = [];
      const dgrp = [];
      for(const p of ps){
        const pvs = p.vertices;
        const pvlen = pvs.length;
        if(p.shared !== undefined){ if(!grps[p.shared]) grps[p.shared] = []; }
        if(pvlen && pvs[0].color !== undefined){ if(!colors) colors = new NBuf3(triCount * 3 * 3); }
        for(let j = 3; j <= pvlen; j++){
          const grp = p.shared === undefined ? dgrp : grps[p.shared];
          grp.push(vertices.top / 3, vertices.top / 3 + 1, vertices.top / 3 + 2);
          vertices.write(pvs[0].pos); vertices.write(pvs[j - 2].pos); vertices.write(pvs[j - 1].pos);
          normals.write(pvs[0].normal); normals.write(pvs[j - 2].normal); normals.write(pvs[j - 1].normal);
          if(uvs){ uvs.write(pvs[0].uv); uvs.write(pvs[j - 2].uv); uvs.write(pvs[j - 1].uv); }
          if(colors){ colors.write(pvs[0].color); colors.write(pvs[j - 2].color); colors.write(pvs[j - 1].color); }
        }
      }
      geom.setAttribute('position', new THREE.BufferAttribute(vertices.array, 3));
      geom.setAttribute('normal', new THREE.BufferAttribute(normals.array, 3));
      if(uvs) geom.setAttribute('uv', new THREE.BufferAttribute(uvs.array, 2));
      if(colors) geom.setAttribute('color', new THREE.BufferAttribute(colors.array, 3));
      for(let gi = 0; gi < grps.length; gi++){ if(grps[gi] === undefined) grps[gi] = []; }
      if(grps.length){
        let index = [];
        let gbase = 0;
        for(let gi = 0; gi < grps.length; gi++){
          geom.addGroup(gbase, grps[gi].length, gi);
          gbase += grps[gi].length;
          index = index.concat(grps[gi]);
        }
        geom.addGroup(gbase, dgrp.length, grps.length);
        index = index.concat(dgrp);
        geom.setIndex(index);
      }
      const inv = new THREE.Matrix4().copy(toMatrix).invert();
      geom.applyMatrix4(inv);
      geom.computeBoundingSphere();
      geom.computeBoundingBox();
      return geom;
    }
    static fromMesh(mesh, objectIndex){
      mesh.updateMatrixWorld(true);
      const csg = CSG.fromGeometry(mesh.geometry, objectIndex);
      const ttvv0 = new THREE.Vector3();
      const tmpm3 = new THREE.Matrix3();
      tmpm3.getNormalMatrix(mesh.matrix);
      for(let i = 0; i < csg.polygons.length; i++){
        const p = csg.polygons[i];
        for(let j = 0; j < p.vertices.length; j++){
          const v = p.vertices[j];
          v.pos.copy(ttvv0.copy(v.pos.toVector3()).applyMatrix4(mesh.matrix));
          v.normal.copy(ttvv0.copy(v.normal.toVector3()).applyMatrix3(tmpm3));
        }
      }
      return csg;
    }
    static toMesh(csg, toMatrix, toMaterial){
      const geom = CSG.toGeometry(csg, toMatrix);
      const m = new THREE.Mesh(geom, toMaterial);
      m.matrix.copy(toMatrix);
      m.matrix.decompose(m.position, m.quaternion, m.scale);
      m.rotation.setFromQuaternion(m.quaternion);
      m.updateMatrixWorld();
      m.castShadow = m.receiveShadow = true;
      return m;
    }
    static union(meshA, meshB){
      const csgA = CSG.fromMesh(meshA), csgB = CSG.fromMesh(meshB);
      return CSG.toMesh(csgA.union(csgB), meshA.matrix, meshA.material);
    }
    static subtract(meshA, meshB){
      const csgA = CSG.fromMesh(meshA), csgB = CSG.fromMesh(meshB);
      return CSG.toMesh(csgA.subtract(csgB), meshA.matrix, meshA.material);
    }
    static intersect(meshA, meshB){
      const csgA = CSG.fromMesh(meshA), csgB = CSG.fromMesh(meshB);
      return CSG.toMesh(csgA.intersect(csgB), meshA.matrix, meshA.material);
    }
    clone(){
      const csg = new CSG();
      csg.polygons = this.polygons.map(p => p.clone()).filter(p => Number.isFinite(p.plane.w));
      return csg;
    }
    toPolygons(){ return this.polygons; }
    union(csg){
      const a = new Node(this.clone().polygons), b = new Node(csg.clone().polygons);
      a.clipTo(b); b.clipTo(a); b.invert(); b.clipTo(a); b.invert();
      a.build(b.allPolygons());
      return CSG.fromPolygons(a.allPolygons());
    }
    subtract(csg){
      const a = new Node(this.clone().polygons), b = new Node(csg.clone().polygons);
      a.invert(); a.clipTo(b); b.clipTo(a); b.invert(); b.clipTo(a); b.invert();
      a.build(b.allPolygons()); a.invert();
      return CSG.fromPolygons(a.allPolygons());
    }
    intersect(csg){
      const a = new Node(this.clone().polygons), b = new Node(csg.clone().polygons);
      a.invert(); b.clipTo(a); b.invert(); a.clipTo(b); b.clipTo(a);
      a.build(b.allPolygons()); a.invert();
      return CSG.fromPolygons(a.allPolygons());
    }
    inverse(){
      const csg = this.clone();
      for(const p of csg.polygons) p.flip();
      return csg;
    }
    toMesh(toMatrix, toMaterial){ return CSG.toMesh(this, toMatrix, toMaterial); }
    toGeometry(toMatrix){ return CSG.toGeometry(this, toMatrix); }
  }

  return CSG;
});
