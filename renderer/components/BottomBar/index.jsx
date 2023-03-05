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
  const { audioState, setAudioState } = props;
  const startPlay = () => {
    ipcRenderer.send("startPlay");
  };
  const pausePlay = () => {
    ipcRenderer.send("pausePlay");
  };
  const nextPlay = () => {
    ipcRenderer.send("nextPlay");
  };

  return (
    <div className="bottom-bar">
      <div className="progress-bar">
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
      <VolumeController audioState={audioState} />
    </div>
  );
}
