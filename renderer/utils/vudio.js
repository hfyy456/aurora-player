/**
 * Web Audio Visualization
 * @author Margox, Alex2wong
 * @version 2.1.1
 */

import { Particle } from "./particle";
(function (factory) {
  /*
   * Support UDM
   */

  if (typeof exports === "object") {
    module.exports = factory();
  } else if (typeof define === "function" && define.amd) {
    define(factory);
  } else {
    window.Vudio = factory();
  }
})(function () {
  "use strict";

  var __default_option = {
    effect: "waveform",
    accuracy: 128,
    waveform: {
      maxHeight: 80,
      minHeight: 1,
      spacing: 1,
      color: "#f00",
      shadowBlur: 0,
      shadowColor: "#f00",
      fadeSide: true,
      horizontalAlign: "center",
      verticalAlign: "middle",
      prettify: true,
    },
    circlewave: {
      maxHeight: 20,
      minHeight: -5,
      spacing: 1,
      color: "#fcc",
      shadowBlur: 2,
      shadowColor: "#caa",
      fadeSide: true,
      prettify: true,
      particle: true,
      maxParticle: 100,
      circleRadius: 128,
      showProgress: true,
    },
    circlebar: {
      maxHeight: 50,
      minHeight: 1,
      spacing: 1,
      color: "#ffffff",
      shadowBlur: 2,
      shadowColor: "#fdfcfb",
      fadeSide: true,
      prettify: true,
      particle: true,
      maxParticle: 90,
      circleRadius: 128,
      showProgress: true,
    },
    lighting: {
      maxHeight: 160,
      maxSize: 8,
      lineWidth: 2,
      color: "#fcc",
      shadowBlur: 1,
      shadowColor: "#c20",
      fadeSide: true,
      prettify: true,
      horizontalAlign: "center",
      verticalAlign: "middle",
    },
  };

  /**
   * Constructor
   * @param {object} audioSource HTMLAudioSource/MediaStream
   * @param {object} canvasElement HTMLCanvasElement
   * @param {object} option Optional
   */
  function Vudio(audio, canvasElement, option) {
    // if (
    //   [
    //     "[object HTMLAudioSource]",
    //     "[object HTMLAudioElement]",
    //     "[object MediaStream]",
    //   ].indexOf(Object.prototype.toString.call(audioSource)) === -1
    // ) {
    //   throw new TypeError("Invaild Audio Source");
    // }

    if (
      Object.prototype.toString.call(canvasElement) !==
      "[object HTMLCanvasElement]"
    ) {
      throw new TypeError("Invaild Canvas Element");
    }

    this.audio = audio;
    this.canvasEle = canvasElement;
    this.option = __mergeOption(__default_option, option);
    this.meta = {};

    this.stat = 0;
    this.freqByteData = null;
    this.particles = [];
    this.coverImg = new Image();

    this.__init();
  }

  // private functions
  function __mergeOption() {
    var __result = {};

    Array.prototype.forEach.call(arguments, function (argument) {
      var __prop;
      var __value;

      for (__prop in argument) {
        if (Object.prototype.hasOwnProperty.call(argument, __prop)) {
          if (
            Object.prototype.toString.call(argument[__prop]) ===
            "[object Object]"
          ) {
            __result[__prop] = __mergeOption(
              __result[__prop],
              argument[__prop]
            );
          } else {
            __result[__prop] = argument[__prop];
          }
        }
      }
    });

    return __result;
  }

  Vudio.prototype = {
    __init: function () {
      // var audioContext = new (window.AudioContext ||
      //     window.webkitAudioContext ||
      //     window.mozAudioContext)(),
      //   source =
      //     Object.prototype.toString.call(this.audioSrc) !==
      //     "[object MediaStream]"
      //       ? audioContext.createMediaElementSource(this.audioSrc)
      //       : audioContext.createMediaStreamSource(this.audioSrc);
      this.analyser = this.audio.analyser;
      this.meta.spr = this.audio.ac.sampleRate;
      this.analyser.fftSize = this.option.accuracy * 2;
      this.analyser.connect(this.audio.ac.destination);

      this.freqByteData = new Uint8Array(this.analyser.frequencyBinCount);

      // prepare for coverImage
      this.coverImg.src = this.option.circlewave.coverImg || "";
      this.context2d = this.canvasEle.getContext("2d");

      var memCanv = document.createElement("canvas");
      this.memCtx = memCanv.getContext("2d");

      this.effects = this.__effects();

      this.__resizeCanvas();

      var playControl = function () {
        // if (this.stat === 0) {
        //   this.audio.audioSrc.play();
        //   this.dance();
        // } else {
        //   this.pause();
        //   this.audio.audioSrc.pause();
        // }
      }.bind(this);

      var handleDragProgress = function (evt) {
        var deltaPercent;
        evt.target.style.cursor = "default";
        evt.preventDefault();
        if (this.audio.audioSrc.duration === undefined) {
          return;
        }
        if (evt.changedTouches && evt.changedTouches.length > 0) {
          deltaPercent =
            (evt.changedTouches[0].clientX - this.startDragPoint) /
            evt.target.width;
        } else {
          deltaPercent = (evt.clientX - this.startDragPoint) / evt.target.width;
        }
        if (Math.abs(deltaPercent) < 0.02) {
          setTimeout(playControl, 0);
          return;
        }
        var targetTime =
          this.audio.audioSrc.currentTime +
          deltaPercent * this.audio.audioSrc.duration;
        if (targetTime < 0) {
          this.audio.audioSrc.currentTime = 0;
        } else if (targetTime > this.audioSrc.duration) {
          this.audio.audioSrc.currentTime = this.audio.audioSrc.duration;
        } else if (!isNaN(deltaPercent)) {
          this.audio.audioSrc.currentTime +=
            deltaPercent * this.audio.audioSrc.duration;
        }
      }.bind(this);

      var handleDragStart = function (evt) {
        //  evt.target.style.cursor = "grab";
        evt.preventDefault();
        if (evt.changedTouches && evt.changedTouches.length > 0) {
          this.startDragPoint = evt.changedTouches[0].clientX;
        } else {
          this.startDragPoint = evt.clientX;
        }
        // evt.target.addEventListener('mousemove', handleDragProgress);
      }.bind(this);

      this.canvasEle.addEventListener("mousedown", handleDragStart);
      this.canvasEle.addEventListener("mouseup", handleDragProgress);

      this.canvasEle.addEventListener("touchstart", handleDragStart);
      this.canvasEle.addEventListener("touchend", handleDragProgress);

      window.onresize = this.__resizeCanvas.bind(this);
    },

    __resizeCanvas() {
      var dpr = window.devicePixelRatio || 1;

      this.width = this.canvasEle.clientWidth;
      this.height = this.canvasEle.clientHeight;
      console.log(this.width, this.height);
      // ready for HD screen
      this.canvasEle.width = this.width * dpr;
      this.canvasEle.height = this.height * dpr;
      this.context2d.scale(dpr, dpr);
      this.context2d.globalCompositeOperation = "lighter";

      // resize memCanvas also.
      this.memCtx.canvas.width = this.width * dpr;
      this.memCtx.canvas.height = this.height * dpr;
      this.memCtx.scale(dpr, dpr);
    },

    __recreateAnalyzer() {
      // var audioContext = new (window.AudioContext ||
      //     window.webkitAudioContext ||
      //     window.mozAudioContext)(),
      //   source =
      //     Object.prototype.toString.call(this.audioSrc) !==
      //     "[object MediaStream]"
      //       ? audioContext.createMediaElementSource(this.audioSrc)
      //       : audioContext.createMediaStreamSource(this.audioSrc);

      this.analyser = this.audio.analyser;
      this.meta.spr = this.audio.ac.sampleRate;
      this.analyser.fftSize = this.option.accuracy * 2;
      this.analyser.connect(this.audio.ac.destination);
    },

    __rebuildData: function (freqByteData, horizontalAlign) {
      var __freqByteData;

      if (horizontalAlign === "left") {
        __freqByteData = freqByteData;
      } else if (horizontalAlign === "right") {
        __freqByteData = Array.from(freqByteData).reverse();
      } else {
        __freqByteData = [].concat(
          Array.from(freqByteData)
            .reverse()
            .slice(this.option.accuracy / 2, this.option.accuracy),
          Array.from(freqByteData).slice(0, this.option.accuracy / 2)
        );
      }

      return __freqByteData;
    },

    readAudioSrc: function (fileEle, vudio, label) {
      if (fileEle.files.length === 0) {
        label.innerText = "Drop Audio file here to play";
        return;
      }
      var file = fileEle.files[0];
      var fr = new FileReader();
      if (file.type.indexOf("audio") !== 0) return;
      label.innerText = file.name;
      fr.onload = function (evt) {
        vudio.audioSrc.src = evt.target.result;
        vudio.audioSrc.play();
        vudio.dance();
      };
      fr.readAsDataURL(file);
    },

    __animate: function () {
      if (this.stat === 1) {
        this.analyser.getByteFrequencyData(this.freqByteData);
        typeof this.effects[this.option.effect] === "function" &&
          this.effects[this.option.effect](this.freqByteData);
        requestAnimationFrame(this.__animate.bind(this));
      }
    },

    __testFrame: function () {
      this.analyser.getByteFrequencyData(this.freqByteData);
      typeof this.__effects()[this.option.effect] === "function" &&
        this.__effects()[this.option.effect](this.freqByteData);
    },

    /**
     * render blured background particles
     */
    __renderMemParticles: function (strokStyle, fillStyle, type) {
      // // generate and render particles if enabled
      if (1) {
        // should clean dead particle before render, remove the first particle if full.
        delete this.particles.find(function (p) {
          return p.dead;
        });
        if (this.particles.length > 50) {
          this.particles.shift();
        } else {
          this.particles.push(
            new Particle({
              x: Math.random() * this.width,
              y: Math.random() * 100 - 50 + this.height / 2,
              vx: Math.random() * 0.2 - 0.3,
              vy: Math.random() * 0.3 - 0.4,
              size: Math.random() * 5,
              life: Math.random() * 50,
              type: type,
              color: fillStyle,
            })
          );
        }
        this.particles.forEach((dot) => {
          dot.update(this.context2d);
        });
      }
    },

    // effect functions
    __effects: function () {
      var __that = this;
      var __dotOpacity = [],
        __dotSize = [];

      return {
        lighting: function (freqByteData) {
          var __lightingOption = __that.option.lighting;
          var __freqByteData = __that.__rebuildData(
            freqByteData,
            __lightingOption.horizontalAlign
          );
          var __maxHeight = __lightingOption.maxHeight;
          var __prettify = __lightingOption.prettify;
          var __dottify = __lightingOption.dottify;
          var __maxSize = __lightingOption.maxSize;
          var __color = __lightingOption.color;
          var __isStart = true,
            __fadeSide = true,
            __x,
            __y,
            __linearGradient;

          if (__lightingOption.horizontalAlign !== "center") {
            __fadeSide = false;
          }

          // clear canvas
          __that.context2d.clearRect(0, 0, __that.width, __that.height);

          // draw lighting
          __that.context2d.lineWidth = __lightingOption.lineWidth;
          __that.context2d.strokeStyle = "rgba(200, 200, 200, .2)";
          __that.context2d.fillStyle = "rgba(200, 200, 200, .2)";
          __that.context2d.globalAlpha = 0.8;
          __that.context2d.beginPath();

          // render particles with blur effect
          __that.context2d.shadowBlur = 4;
          __that.context2d.shadowColor = __that.context2d.fillStyle;
          __that.__renderMemParticles(
            null,
            __that.context2d.shadowColor,
            "rect"
          );

          if (__color instanceof Array) {
            __linearGradient = __that.context2d.createLinearGradient(
              0,
              __that.height / 2,
              __that.width,
              __that.height / 2
            );

            __color.forEach(function (color, index) {
              var __pos, effectiveColor;
              if (color instanceof Array) {
                effectiveColor = color[1];
              } else {
                effectiveColor = color;
              }
              __pos = index / __color.length;
              __linearGradient.addColorStop(__pos, effectiveColor);
            });

            __that.context2d.fillStyle = __linearGradient;
            __that.context2d.strokeStyle = __linearGradient;
          } else {
            __that.context2d.fillStyle = __color;
            __that.context2d.strokeStyle = __color;
          }

          __freqByteData.forEach(function (value, index) {
            if (__prettify) {
              // prettify for line should be less maxHeight at tail.
              if (index < __that.option.accuracy / 2) {
                __maxHeight =
                  (1 -
                    (__that.option.accuracy / 2 - 1 - index) /
                      (__that.option.accuracy / 2)) *
                  __lightingOption.maxHeight;
              } else {
                __maxHeight =
                  (1 -
                    (index - __that.option.accuracy / 2) /
                      (__that.option.accuracy / 2)) *
                  __lightingOption.maxHeight;
              }
            } else {
              __maxHeight = __lightingOption.maxHeight;
            }

            if (__fadeSide) {
              if (index <= __that.option.accuracy / 2) {
                __that.context2d.globalAlpha =
                  1 -
                  (__that.option.accuracy / 2 - 1 - index) /
                    (__that.option.accuracy / 2);
              } else {
                __that.context2d.globalAlpha =
                  1 -
                  (index - __that.option.accuracy / 2) /
                    (__that.option.accuracy / 2);
              }
            } else {
              __that.context2d.globalAlpha = 1;
            }

            __x = (__that.width / __that.option.accuracy) * index;
            var __tmpY = (value / 256) * __maxHeight;

            if (__lightingOption.verticalAlign === "middle") {
              __y = (__that.height - __tmpY) / 2;
            } else if (__lightingOption.verticalAlign === "bottom") {
              __y = __that.height - __tmpY;
            } else if (__lightingOption.verticalAlign === "top") {
              __y = __tmpY;
            } else {
              __y = (__that.height - __tmpY) / 2;
            }

            if (__dottify && index !== 0 && index % 2 === 0) {
              __that.context2d.beginPath();
              __dotSize[index] =
                __dotSize[index] !== undefined
                  ? __dotSize[index]
                  : Math.random() * __maxSize + 1;
              // __dotOpacity[index] = __dotOpacity[index] !== undefined ? __dotOpacity[index] : Math.random();
              __that.context2d.arc(__x, __y, __dotSize[index], 0, Math.PI * 2);

              // // make some noise under this x coord
              // if (__lightingOption.verticalAlign !== 'top') {
              //     while(__y < (__that.height / 2 - 10)) {
              //         __y += Math.random() * 2 + 10;
              //         __that.context2d.arc(__x, __y, __dotSize[index], 0, Math.PI * 2);
              //     }
              // }

              __that.context2d.fill();
            } else if (!__dottify) {
              if (__isStart) {
                __that.context2d.moveTo(__x, __y);
                __isStart = false;
              } else {
                __that.context2d.lineTo(__x, __y);
              }
            }
          });
          if (!__dottify) {
            __that.context2d.stroke();
            __that.context2d.globalAlpha = 0.6;
            __that.context2d.fill();
          }
          __that.drawBarProgress(
            __color,
            __that.audio.audioSrc.currentTime / __that.audio.audioSrc.duration
          );
        },

        circlewave: function (freqByteData) {
          var __circlewaveOption = __that.option.circlewave;
          var __fadeSide = __circlewaveOption.fadeSide;
          var __prettify = __circlewaveOption.prettify;
          var __freqByteData = __that.__rebuildData(
            freqByteData,
            __circlewaveOption.horizontalAlign
          );
          var __angle = (Math.PI * 2) / __freqByteData.length;
          var __maxHeight,
            __width,
            __height,
            __left,
            __top,
            __color,
            __linearGradient,
            __pos;
          var circleRadius = __circlewaveOption.circleRadius;
          var __particle = __circlewaveOption.particle;
          var __maxParticle = __circlewaveOption.maxParticle;
          var __showProgress = __circlewaveOption.showProgress;
          var __progress =
            __that.audio.audioSrc.currentTime / __that.audio.audioSrc.duration;
          var __isStart = true;
          __color = __circlewaveOption.color;

          if (__circlewaveOption.horizontalAlign !== "center") {
            __fadeSide = false;
            __prettify = false;
          }

          // clear canvas
          __that.context2d.clearRect(0, 0, __that.width, __that.height);
          __that.context2d.save();
          __that.context2d.lineWidth = 4;
          __that.context2d.fillStyle = "rgba(200, 200, 200, .2)";
          __that.context2d.translate(
            __that.width / 2 - 0.5,
            __that.height / 2 - 0.5
          );

          if (__circlewaveOption.shadowBlur > 0) {
            __that.context2d.shadowBlur = __circlewaveOption.shadowBlur;
            __that.context2d.shadowColor = __circlewaveOption.shadowColor;
          }

          // generate and render particles if enabled
          if (__particle) {
            // should clean dead particle before render.
            delete __that.particles.find(function (p) {
              return p.dead;
            });
            if (__that.particles.length > __maxParticle) {
              __that.particles.shift();
            } else {
              const deg = Math.random() * Math.PI * 2;
              __that.particles.push(
                new Particle({
                  x: (circleRadius + 30) * Math.sin(deg),
                  y: (circleRadius + 30) * Math.cos(deg),
                  vx: 0.3 * Math.sin(deg) + Math.random() * 0.5 - 0.3,
                  vy: 0.3 * Math.cos(deg) + Math.random() * 0.5 - 0.3,
                  life: Math.random() * 10,
                })
              );
            }

            __that.particles.forEach((dot) => {
              dot.update(__that.context2d);
            });
          }

          __that.context2d.beginPath();

          // draw circlewave
          __freqByteData.forEach(function (value, index) {
            __width =
              (circleRadius * Math.PI -
                __that.option.accuracy * __circlewaveOption.spacing) /
              __that.option.accuracy;
            __left = index * (__width + __circlewaveOption.spacing);
            __circlewaveOption.spacing !== 1 &&
              (__left += __circlewaveOption.spacing / 2);

            if (__prettify) {
              if (index <= __that.option.accuracy / 2) {
                __maxHeight =
                  (1 -
                    (__that.option.accuracy / 2 - 1 - index) /
                      (__that.option.accuracy / 2)) *
                  __circlewaveOption.maxHeight;
              } else {
                __maxHeight =
                  (1 -
                    (index - __that.option.accuracy / 2) /
                      (__that.option.accuracy / 2)) *
                  __circlewaveOption.maxHeight;
              }
            } else {
              __maxHeight = __circlewaveOption.maxHeight;
            }

            __height = (value / 256) * __maxHeight;
            __height =
              __height < __circlewaveOption.minHeight
                ? __circlewaveOption.minHeight
                : __height;

            if (__color instanceof Array) {
              __linearGradient = __that.context2d.createLinearGradient(
                -circleRadius - __maxHeight,
                -circleRadius - __maxHeight,
                circleRadius + __maxHeight,
                circleRadius + __maxHeight
              );

              __color.forEach(function (color, index) {
                var __pos, effectiveColor;
                if (color instanceof Array) {
                  effectiveColor = color[1];
                } else {
                  effectiveColor = color;
                }
                __pos = index / __color.length;
                __linearGradient.addColorStop(__pos, effectiveColor);
              });

              __that.context2d.strokeStyle = __linearGradient;
              __that.context2d.fillStyle = __linearGradient;
            } else {
              __that.context2d.strokeStyle = __color;
              __that.context2d.fillStyle = __color;
            }

            if (__fadeSide) {
              if (index <= __that.option.accuracy / 2) {
                __that.context2d.globalAlpha =
                  1 -
                  (__that.option.accuracy / 2 - 1 - index) /
                    (__that.option.accuracy / 2);
              } else {
                __that.context2d.globalAlpha =
                  1 -
                  (index - __that.option.accuracy / 2) /
                    (__that.option.accuracy / 2);
              }
            } else {
              __that.context2d.globalAlpha = 1;
            }

            var curAngle = __angle * index;
            var __x = Math.sin(curAngle) * (circleRadius + __height);
            var __y = Math.cos(curAngle) * (circleRadius + __height);

            // __that.context2d.rotate(__angle * index);
            if (__isStart) {
              __that.context2d.moveTo(__x, __y);
              __isStart = false;
            } else {
              __that.context2d.lineTo(__x, __y);
            }
          });
          var globalAlpha = __that.context2d.globalAlpha;
          __that.context2d.closePath();
          __that.context2d.stroke();
          __that.context2d.globalAlpha = 0.5;
          __that.context2d.fill();
          __that.context2d.globalAlpha = globalAlpha;

          __that.drawCover(__progress, circleRadius);
          if (__showProgress) {
            __that.drawProgress(__color, __progress, circleRadius);
          }

          // need to restore canvas after translate to center..
          __that.context2d.restore();
        },

        circlebar: function (freqByteData) {
          var __circlebarOption = __that.option.circlebar;
          var __fadeSide = __circlebarOption.fadeSide;
          var __prettify = __circlebarOption.prettify;
          var __freqByteData = __that.__rebuildData(
            freqByteData,
            __circlebarOption.horizontalAlign
          );
          var __angle = (Math.PI * 2) / __freqByteData.length;
          var __maxHeight, __width, __height, __left, __top, __color, __pos;
          var circleRadius = __circlebarOption.circleRadius;
          var __particle = __circlebarOption.particle;
          var __maxParticle = __circlebarOption.maxParticle;
          var __showProgress = __circlebarOption.showProgress;
          var __progress =
            __that.audio.audioSrc.currentTime / __that.audio.audioSrc.duration;
          var __offsetX = 0;

          if (__circlebarOption.horizontalAlign !== "center") {
            __fadeSide = false;
            __prettify = false;
          }

          // clear canvas
          __that.context2d.clearRect(0, 0, __that.width, __that.height);
          __that.context2d.save();
          __that.context2d.translate(
            __that.width / 2 - 0.5,
            __that.height / 2 - 0.5
          );

          if (__circlebarOption.shadowBlur > 0) {
            __that.context2d.shadowBlur = __circlebarOption.shadowBlur;
            __that.context2d.shadowColor = __circlebarOption.shadowColor;
          }

          // generate and render particles if enabled
          if (__particle) {
            delete __that.particles.find(function (p) {
              return p.dead;
            });
            if (__that.particles.length > __maxParticle) {
              __that.particles.shift();
            } else {
              const deg = Math.random() * Math.PI * 2;
              __that.particles.push(
                new Particle({
                  x: (circleRadius + 20) * Math.sin(deg),
                  y: (circleRadius + 20) * Math.cos(deg),
                  vx: 0.3 * Math.sin(deg) + Math.random() * 0.5 - 0.3,
                  vy: 0.3 * Math.cos(deg) + Math.random() * 0.5 - 0.3,
                  life: Math.random() * 10,
                  // type: 'rect'
                })
              );
            }
            __that.particles.forEach((dot) => {
              dot.update(__that.context2d);
            });
          }

          __width =
            (circleRadius * Math.PI -
              __that.option.accuracy * __circlebarOption.spacing) /
            __that.option.accuracy;
          __offsetX = -__width / 2;
          __color = __circlebarOption.color;
          // since circlebar use ctx.rotate for each bar, so do NOT support gradient in bar currently.
          var renderStyle = __color instanceof Array ? __color[0] : __color;
          __that.context2d.fillStyle = renderStyle;

          __that.context2d.globalAlpha = 1;
          __that.context2d.beginPath();

          // draw circlebar
          // console.warn('__freqBytesData: ', __freqByteData, ' first entry height: ', __freqByteData[1] / 256 * __circlebarOption.maxHeight);
          for (var index = __freqByteData.length - 1; index >= 0; index--) {
            var value = __freqByteData[index];
            __left = index * (__width + __circlebarOption.spacing);
            __circlebarOption.spacing !== 1 &&
              (__left += __circlebarOption.spacing / 2);

            if (false) {
              if (index <= __that.option.accuracy / 2) {
                __maxHeight =
                  (1 -
                    (__that.option.accuracy / 2 - 1 - index) /
                      (__that.option.accuracy / 2)) *
                  __circlebarOption.maxHeight;
              } else {
                __maxHeight =
                  (1 -
                    (index - __that.option.accuracy / 2) /
                      (__that.option.accuracy / 2)) *
                  __circlebarOption.maxHeight;
              }
            } else {
              __maxHeight = __circlebarOption.maxHeight;
            }

            __height = (value / 256) * __maxHeight;
            __height =
              __height < __circlebarOption.minHeight
                ? __circlebarOption.minHeight
                : __height;

            if (__fadeSide) {
              if (index <= __that.option.accuracy / 2) {
                __that.context2d.globalAlpha =
                  1 -
                  (__that.option.accuracy / 2 - 1 - index) /
                    (__that.option.accuracy / 2);
              } else {
                __that.context2d.globalAlpha =
                  1 -
                  (index - __that.option.accuracy / 2) /
                    (__that.option.accuracy / 2);
              }
            }

            __that.context2d.rotate(__angle);
            __that.context2d.rect(__offsetX, circleRadius, __width, __height);
          }
          __that.context2d.closePath();
          __that.context2d.fill();

          __that.drawCover(__progress, circleRadius);
          if (__showProgress) {
            __that.drawProgress(renderStyle, __progress, circleRadius);
          }

          // need to restore canvas after translate to center..
          __that.context2d.restore();
        },

        waveform: function (freqByteData) {
          var __waveformOption = __that.option.waveform;
          var __fadeSide = __waveformOption.fadeSide;
          var __prettify = __waveformOption.prettify;
          var __freqByteData = __that.__rebuildData(
            freqByteData,
            __waveformOption.horizontalAlign
          );
          var __maxHeight,
            __width,
            __height,
            __left,
            __top,
            __color,
            __linearGradient,
            __pos;

          if (__waveformOption.horizontalAlign !== "center") {
            __fadeSide = false;
            __prettify = false;
          }

          // clear canvas
          __that.context2d.clearRect(0, 0, __that.width, __that.height);

          // draw waveform
          __freqByteData.forEach(function (value, index) {
            __width =
              (__that.width -
                __that.option.accuracy * __waveformOption.spacing) /
              __that.option.accuracy;
            __left = index * (__width + __waveformOption.spacing);
            __waveformOption.spacing !== 1 &&
              (__left += __waveformOption.spacing / 2);

            if (__prettify) {
              // enable soft slope along side frequency axes
              if (index <= __that.option.accuracy / 2) {
                __maxHeight =
                  (1 -
                    (__that.option.accuracy / 2 - 1 - index) /
                      (__that.option.accuracy / 2)) *
                  __waveformOption.maxHeight;
              } else {
                __maxHeight =
                  (1 -
                    (index - __that.option.accuracy / 2) /
                      (__that.option.accuracy / 2)) *
                  __waveformOption.maxHeight;
              }
            } else {
              __maxHeight = __waveformOption.maxHeight;
            }

            __height = (value / 256) * __maxHeight;
            __height =
              __height < __waveformOption.minHeight
                ? __waveformOption.minHeight
                : __height;

            if (__waveformOption.verticalAlign === "middle") {
              __top = (__that.height - __height) / 2;
            } else if (__waveformOption.verticalAlign === "top") {
              __top = 0;
            } else if (__waveformOption.verticalAlign === "bottom") {
              __top = __that.height - __height;
            } else {
              __top = (__that.height - __height) / 2;
            }

            __color = __waveformOption.color;

            if (__color instanceof Array) {
              __linearGradient = __that.context2d.createLinearGradient(
                __left,
                __top,
                __left,
                __top + __height
              );

              __color.forEach(function (color, index) {
                if (color instanceof Array) {
                  __pos = color[0];
                  color = color[1];
                } else if (index === 0 || index === __color.length - 1) {
                  __pos = index / (__color.length - 1);
                } else {
                  __pos = index / __color.length + 0.5 / __color.length;
                }
                __linearGradient.addColorStop(__pos, color);
              });

              __that.context2d.fillStyle = __linearGradient;
            } else {
              __that.context2d.fillStyle = __color;
            }

            if (__waveformOption.shadowBlur > 0) {
              __that.context2d.shadowBlur = __waveformOption.shadowBlur;
              __that.context2d.shadowColor = __waveformOption.shadowColor;
            }

            if (__fadeSide) {
              if (index <= __that.option.accuracy / 2) {
                __that.context2d.globalAlpha =
                  1 -
                  (__that.option.accuracy / 2 - 1 - index) /
                    (__that.option.accuracy / 2);
              } else {
                __that.context2d.globalAlpha =
                  1 -
                  (index - __that.option.accuracy / 2) /
                    (__that.option.accuracy / 2);
              }
            } else {
              __that.context2d.globalAlpha = 1;
            }

            __that.context2d.fillRect(__left, __top, __width, __height);
          });

          __that.drawBarProgress(
            __color,
            __that.audio.audioSrc.currentTime / __that.audio.audioSrc.duration
          );
        },
      };
    },

    dance: function () {
      if (this.stat === 0 || this.analyser.context.state === "suspended") {
        this.analyser.context.resume();
        this.stat = 1;
        this.__animate();
      }
      return this;
    },

    pause: function () {
      this.stat = 0;
      //// for saving CPU, could cancle animation.
      return this;
    },

    setOption: function (option) {
      this.option = __mergeOption(this.option, option);
    },

    drawCover: function (__progress, circleRadius) {
      var __that = this;
      // draw cover image
      if (__that.coverImg.width == 0) {
        var img = __that.coverImg;
        __that.context2d.save();
        __that.context2d.lineWidth = 0.5;
        __that.context2d.shadowColor = 0;

        __that.context2d.globalCompositeOperation = "source-over";
        __that.context2d.beginPath();

        __that.context2d.arc(
          0,
          0,
          circleRadius - 13,
          -Math.PI / 2,
          Math.PI * 2
        );
        __that.context2d.clip();
        __that.context2d.rotate(Math.PI * 2 * __progress * 2);

        if (img.width / img.height > 1) {
          var croppedImgWidth =
            (circleRadius * 2 * (img.width - img.height)) / img.height;
          __that.context2d.drawImage(
            img,
            -circleRadius - 10 - croppedImgWidth / 2,
            -circleRadius - 10,
            (circleRadius * 2 * img.width) / img.height,
            circleRadius * 2
          );
        } else {
          __that.context2d.drawImage(
            img,
            -circleRadius - 10,
            -circleRadius - 10,
            circleRadius * 2,
            (circleRadius * 2 * img.height) / img.width
          );
        }
        __that.context2d.restore();
      }
    },

    drawProgress: function (__color, __progress, circleRadius) {
      // draw progress circular.
      var __that = this;
      __that.context2d.beginPath();
      if (__color) {
        __that.context2d.strokeStyle = __color;
        __that.context2d.lineWidth = 4;
        __that.context2d.lineCap = "round";
      }
      __that.context2d.arc(
        0,
        0,
        circleRadius - 10,
        -Math.PI / 2,
        Math.PI * 2 * __progress - Math.PI / 2
      );
      __that.context2d.stroke();
    },

    drawBarProgress: function (__color = "#eee", __progress) {
      var __that = this;
      var canv = __that.context2d.canvas;
      var lineY = canv.height * 0.7;
      var lineX = 5 + __progress * (canv.width - 8);
      __that.context2d.beginPath();
      if (__color) {
        __that.context2d.globalAlpha = 0.3;
        __that.context2d.strokeStyle = "#eee";
        __that.context2d.shadowBlur = 4;
        __that.context2d.shadowColor = "#eee";
        __that.context2d.lineWidth = 2;
        __that.context2d.lineCap = "round";
      }
      __that.context2d.moveTo(5, lineY);
      __that.context2d.lineTo(lineX, lineY);
      __that.context2d.arc(lineX, lineY, 2, 0, Math.PI * 2);
      __that.context2d.stroke();
    },
  };

  return Vudio;
});
