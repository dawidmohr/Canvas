        Filters = {};
        var cwidth;
        var cheight;

        Filters.getPixels = function(img) {
          var c,ctx;
          if (img.getContext) {
            c = img;
            try { ctx = c.getContext('2d'); } catch(e) {}
          }
          if (!ctx) {
            c = this.getCanvas(img.width, img.height);
            ctx = c.getContext('2d');
            ctx.drawImage(img, 0, 0);
            cwidth = c.width;
            cheight = c.height;
          }

          return ctx.getImageData(0,0,c.width,c.height);
        };

        Filters.getCanvas = function(w,h) {
          var c = document.createElement('canvas');
          c.width = w;
          c.height = h;
          return c;
        };

        Filters.filterImage = function(filter, image, var_args) {
          var args = [this.getPixels(image)];
          console.log(arguments);
          for (var i=2; i<arguments.length; i++) {
            args.push(arguments[i]);
          }
          return filter.apply(null, args);
        };

        Filters.opacity = function(pixels, args) {

          var doWhatMustBeDone = function(){

            var b = d[i+3];
            d[i+3] = 0.2*b;
          }

          var d = pixels.data;
           d.length

          for (var i=0; i<d.length ; i+=4) {
           if (i<cwidth*4*100 || i>cwidth*4*270 || cwidth>i%(cwidth*4)|| i%(cwidth*4)>cwidth*3 ){
              doWhatMustBeDone();
            }
          }
          return pixels;
        };

        Filters.createImageData = function(w,h) {
          return this.tmpCtx.createImageData(w,h);
        };

        Filters.convolute = function(pixels, weights, opaque) {
          var side = Math.round(Math.sqrt(weights.length));
          var halfSide = Math.floor(side/2);

          var src = pixels.data;
          var sw = pixels.width;
          var sh = pixels.height;

          var w = sw;
          var h = sh;
          var output = Filters.createImageData(w, h);
          var dst = output.data;

          var alphaFac = opaque ? 1 : 0;

          for (var y=0; y<h; y++) {
            for (var x=0; x<w; x++) {
              var sy = y;
              var sx = x;
              var dstOff = (y*w+x)*4;
              var r=0, g=0, b=0, a=0;
              for (var cy=0; cy<side; cy++) {
                for (var cx=0; cx<side; cx++) {
                  var scy = Math.min(sh-1, Math.max(0, sy + cy - halfSide));
                  var scx = Math.min(sw-1, Math.max(0, sx + cx - halfSide));
                  var srcOff = (scy*sw+scx)*4;
                  var wt = weights[cy*side+cx];
                  r += src[srcOff] * wt;
                  g += src[srcOff+1] * wt;
                  b += src[srcOff+2] * wt;
                  a += src[srcOff+3] * wt;
                }
              }
              dst[dstOff] = r;
              dst[dstOff+1] = g;
              dst[dstOff+2] = b;
              dst[dstOff+3] = a + alphaFac*(255-a);
            }
          }
          return output;
        };

        if (!window.Float32Array)
          Float32Array = Array;

        Filters.convoluteFloat32 = function(pixels, weights, opaque) {
          var side = Math.round(Math.sqrt(weights.length));
          var halfSide = Math.floor(side/2);

          var src = pixels.data;
          var sw = pixels.width;
          var sh = pixels.height;

          var w = sw;
          var h = sh;
          var output = {
            width: w, height: h, data: new Float32Array(w*h*4)
          };
          var dst = output.data;

          var alphaFac = opaque ? 1 : 0;

          for (var y=0; y<h; y++) {
            for (var x=0; x<w; x++) {
              var sy = y;
              var sx = x;
              var dstOff = (y*w+x)*4;
              var r=0, g=0, b=0, a=0;
              for (var cy=0; cy<side; cy++) {
                for (var cx=0; cx<side; cx++) {
                  var scy = Math.min(sh-1, Math.max(0, sy + cy - halfSide));
                  var scx = Math.min(sw-1, Math.max(0, sx + cx - halfSide));
                  var srcOff = (scy*sw+scx)*4;
                  var wt = weights[cy*side+cx];
                  r += src[srcOff] * wt;
                  g += src[srcOff+1] * wt;
                  b += src[srcOff+2] * wt;
                  a += src[srcOff+3] * wt;
                }
              }
              dst[dstOff] = r;
              dst[dstOff+1] = g;
              dst[dstOff+2] = b;
              dst[dstOff+3] = a + alphaFac*(255-a);
            }
          }
          return output;
        };







         var img = document.getElementById('orig');
    img.addEventListener('load', function() {

      var canvases = document.getElementsByTagName('canvas');
      for (var i=0; i<canvases.length; i++) {
        var c = canvases[i];
        c.parentNode.insertBefore(img.cloneNode(true), c);
        c.style.display = 'none';
      }

      function runFilter(id, filter, arg1, arg2, arg3) {
        var c = document.getElementById(id);
        var s = c.previousSibling.style;
        var b = c.parentNode.getElementsByTagName('button')[0];
        if (b.originalText == null) {
          b.originalText = b.textContent;
        }
        if (s.display == 'none') {
          s.display = 'inline';
          c.style.display = 'none';
          b.textContent = b.originalText;
        } else {
          var idata = Filters.filterImage(filter, img, arg1, arg2, arg3);
          c.width = idata.width;
          c.height = idata.height;
          var ctx = c.getContext('2d');
          ctx.putImageData(idata, 0, 0);
          s.display = 'none';
          c.style.display = 'inline';
          b.textContent = 'Restore original image';
        }
      }

      opacity = function() {
        runFilter('opacity', Filters.opacity);
      }
    }, false);