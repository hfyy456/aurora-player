import { useEffect, useRef, useState } from "react";
import { parseData } from "@/utils/message";
const { ipcRenderer } = require("electron");
import "./style.scss";
const AC = new window.AudioContext();
const analyser = AC.createAnalyser();
const gainnode = AC.createGain();
let source;
gainnode.gain.value = 1;
let audio = null;
let info = null;
let setVolume = 0;
export default function Player(props) {
  const { audioState, setAudioState } = props;
  let refAudio = useRef(0);
  setVolume = audioState.volume;
  const initListener = () => {
    ipcRenderer.on("switchMusic", (event, args) => {
      let res = parseData(args);
      if (res.code == 0) {
        let ms = res.data.ms;
        if (info && info.url == ms.url && audio) {
          audio.play();
        } else if (audio) {
          info = ms;
          audio.src = info.url;
        } else {
          info = ms;
          initAudio(info.url);
        }
        setAudioState({
          ...audioState,
          info: info,
          playing: true,
        });
      }
    });
    ipcRenderer.on("pausePlay", (event, args) => {
      console.log("pause");
      audio.pause();
    });
    ipcRenderer.on("setVolume", (event, args) => {
      console.log(args);
      if (audio) {
        audio.volume = parseInt(args) / 100;
      } else {
        setVolume = audio.volume * 100;
      }
    });
  };

  useEffect(() => {
    initListener();
  }, []);
  const initCanvas = () => {
    var canvasObj = document.querySelector("#audio_cavs");
    var vudio = new Vudio(
      {
        ac: AC,
        analyser: analyser,
        source: source,
        audioSrc: audio,
      },
      canvasObj,
      {
        effect: "circlebar", // 当前只有'waveform'这一个效果，哈哈哈
        accuracy: 128, // 精度,实际表现为波形柱的个数，范围16-16348，必须为2的N次方
        circlebar: {
          maxHeight: 40,
          particle: true,
        },
      }
    );
    vudio.dance();
  };
  const initAudio = (src) => {
    audio = refAudio.current;
    audio.src = src;
    audio.volume = setVolume / 100;
    source = AC.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(gainnode);
    gainnode.connect(AC.destination);
    initCanvas();
    audio.ontimeupdate = () => {
      setAudioState({
        ...audioState,
        info: info,
        currentTime: audio.currentTime,
        playing: true,
      });
    };
    audio.onplaying = () => {
      setAudioState({
        ...audioState,
        playing: true,
        info: info,
        currentTime: audio.currentTime,
      });
    };

    audio.onpause = () => {
      setAudioState({
        ...audioState,
        info: info,
        currentTime: audio.currentTime,
        playing: false,
      });
    };
  };
  return (
    <>
      <audio
        id="audio"
        ref={refAudio}
        className="text-3xl font-bold underline"
        crossOrigin="true"
        preload="true"
        src="default"
        autoPlay={true}
      ></audio>
    </>
  );
}
