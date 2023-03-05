import "./style.scss";
import {
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
} from "@chakra-ui/react";
import { faVolumeHigh, faVolumeLow } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect } from "react";
const { ipcRenderer } = require("electron");

export default function VolumeController(props) {
  const { audioState } = props;
  useEffect(() => {
    console.log(audioState.volume, "volume");
  }, []);
  const setSliderValue = (v) => {
    ipcRenderer.send("setVolume", v);
  };
  return (
    <>
      <Popover closeOnBlur={true}>
        <PopoverTrigger>
          <div className="volume-controller">
            <FontAwesomeIcon icon={faVolumeLow} />
          </div>
        </PopoverTrigger>
        <PopoverContent width={"80px"}>
          <PopoverArrow />
          <div className="volume-bar">
            <Slider
              aria-label="slider-ex-3"
              defaultValue={audioState.volume}
              orientation="vertical"
              minH="32"
              onChange={(v) => setSliderValue(v)}
            >
              <SliderTrack>
                <SliderFilledTrack bg="tomato" />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
