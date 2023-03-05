import "./style.scss";
import ActionMenu from "../ActionMenu";
const { ipcRenderer } = require("electron");
let lock = false;
import { Button } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { parseData } from "@/utils/message";
import { useEffect, useState } from "react";

export default function LeftBar(props) {
  const { playList, setHide, hideList, loading, setLoading, setPlayList } =
    props;
  const [filterList, setFilterList] = useState(null);
  const [keyword, setKeyword] = useState("");
  const switchMusic = (item) => {
    if (lock) {
      return;
    }
    lock = true;
    setTimeout(() => {
      lock = false;
    }, 1000);
    console.log(item, "click");
    ipcRenderer.send("switchMusic", JSON.stringify(item));
  };
  useEffect(() => {
    if (!playList) {
      setFilterList(null);
    } else {
      setFilterList(filterArray(keyword, playList.list));
    }
  }, [playList]);
  const filterArray = (k, list) => {
    let newList = list.filter((item) => {
      return (
        (item.artist && item.artist.indexOf(k) > -1) ||
        (item.title && item.title.indexOf(k) > -1)
      );
    });
    return newList;
  };
  const openFileSystem = async () => {
    setLoading(true);
    let res = await mmsdk.openFileSystem();
    if (res.code == 0) {
      console.log(res.data.playList);
      setPlayList(res.data.playList);
    }
    setLoading(false);
  };
  const changeVal = (e) => {
    let v = e.target.value;
    setKeyword(v);
    setFilterList(filterArray(v, playList.list));
  };
  return (
    <div
      className={`left-bar ${hideList ? "slide-out-left" : "slide-in-left"}`}
    >
      <div className="play-item">
        <div className="item-id">序号</div>
        <div className="item-name">歌曲</div>
        <div className="item-author">歌手</div>
        <div className="item-time">时长</div>{" "}
      </div>
      <div className="play-list">
        {filterList &&
          filterList.length > 0 &&
          filterList.map((item, index) => {
            return (
              <div
                key={`m_${index}`}
                className="play-item play-item_hover"
                onDoubleClick={() => switchMusic(item)}
              >
                <div className="item-id">{item.id}</div>
                <div className="item-name">{item.title || "未知"}</div>
                <div className="item-author">{item.artist || "未知"}</div>
                <div className="item-time">
                  {`${parseInt(item.duration / 60)}:${
                    Math.floor(item.duration % 60) >= 10
                      ? Math.floor(item.duration % 60)
                      : "0" + Math.floor(item.duration % 60)
                  }`}
                </div>
              </div>
            );
          })}
        {filterList && filterList.length == 0 && (
          <div className="import-btn">暂无数据~</div>
        )}
        {!filterList && (
          <div className="import-btn">
            <Button
              onClick={openFileSystem}
              variant="outline"
              size="sm"
              colorScheme="pink"
              leftIcon={<AddIcon />}
              isLoading={loading}
            >
              导入目录
            </Button>
          </div>
        )}
      </div>
      <div className="left-btm">
        <div class="container-input">
          <input
            type="text"
            placeholder="Search"
            name="text"
            class="input"
            onInput={changeVal}
          />
          <svg
            fill="#000000"
            width="14px"
            height="14px"
            viewBox="0 0 1920 1920"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M790.588 1468.235c-373.722 0-677.647-303.924-677.647-677.647 0-373.722 303.925-677.647 677.647-677.647 373.723 0 677.647 303.925 677.647 677.647 0 373.723-303.924 677.647-677.647 677.647Zm596.781-160.715c120.396-138.692 193.807-319.285 193.807-516.932C1581.176 354.748 1226.428 0 790.588 0S0 354.748 0 790.588s354.748 790.588 790.588 790.588c197.647 0 378.24-73.411 516.932-193.807l516.028 516.142 79.963-79.963-516.142-516.028Z"
              fill-rule="evenodd"
            ></path>
          </svg>
        </div>

        <ActionMenu />
      </div>
    </div>
  );
}
