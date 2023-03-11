import {
  faBackward,
  faForward,
  faPlay,
  faStop,
} from "@fortawesome/free-solid-svg-icons";
import VolumeController from "../VolumeController";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
const { ipcRenderer } = require("electron");
import "./style.scss";
export default function BottomBar(props) {
  const { audioState, setAudioState, immersiveMode } = props;
  const startPlay = () => {
    ipcRenderer.send("startPlay");
  };
  const pausePlay = () => {
    ipcRenderer.send("pausePlay");
  };
  const nextPlay = () => {
    ipcRenderer.send("nextPlay");
  };
  const setProgress = (e) => {
    console.log(e);
    const node = document.getElementById("prg");
    let bound = node.getBoundingClientRect();
    console.log(bound.x, e.clientX, bound);
    let total = bound.width;
    let left = e.clientX - bound.x;
    let percent = left / total;
    console.log(percent);
    ipcRenderer.send("setProgress", percent);
  };
  return (
    <div
      className={`bottom-bar bottom-bar_${immersiveMode ? "immersive" : ""}`}
    >
      <div id="prg" className="progress-bar" onClick={setProgress}>
        <div
          className="progress-inner"
          style={{
            transform: `translateX(-${
              (1 - audioState.currentTime / audioState.info.duration) * 100 || 0
            }%)`,
          }}
        ></div>
      </div>

      <div className="play-actions">
        <div className="main-icon">
          <FontAwesomeIcon icon={faBackward} />
        </div>
        {audioState.playing ? (
          <div className="main-icon" onClick={() => pausePlay()}>
            <FontAwesomeIcon icon={faStop} />
          </div>
        ) : (
          <div className="main-icon" onClick={() => startPlay()}>
            <FontAwesomeIcon icon={faPlay} />
          </div>
        )}

        <div className="main-icon">
          <FontAwesomeIcon icon={faForward} onClick={() => nextPlay()} />
        </div>
      </div>
      <VolumeController audioState={audioState} immersiveMode={immersiveMode} />
    </div>
  );
}
