function c(i,n,s={}){let t;return n&&(t=(r,a)=>{const e=new WebAssembly.Instance(n,r);return a(e),e.exports}),i({noInitialRun:!0,instantiateWasm:t,...s})}export{c as i};
