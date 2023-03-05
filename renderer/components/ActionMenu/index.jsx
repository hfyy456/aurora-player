import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from "@chakra-ui/react";

import {
  faBars,
  faGear,
  faInbox,
  faTrash,
  faRotate,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
const { ipcRenderer } = require("electron");
import "./style.scss";
export default function ActionMenu() {
  const clearSotre = () => {
    ipcRenderer.invoke("clearStore");
    setTimeout(() => {
      location.reload()
    }, 1000);
    console.log("clear");
  };
  return (
    <Menu>
      <MenuButton
        as={IconButton}
        aria-label="Options"
        icon={<FontAwesomeIcon icon={faBars} />}
        variant="outline"
        size="xs"
      />
      <MenuList classname="acm-menu">
        <MenuItem icon={<FontAwesomeIcon icon={faGear} />} command="⌘O">
          设置
        </MenuItem>
        <MenuItem icon={<FontAwesomeIcon icon={faRotate} />} command="⌘O">
          重新导入
        </MenuItem>
        <MenuItem
          icon={<FontAwesomeIcon icon={faTrash} />}
          onClick={clearSotre}
          command="⌘O"
        >
          清除缓存
        </MenuItem>
        <MenuItem icon={<FontAwesomeIcon icon={faInbox} />} command="⌘C">
          退出程序
        </MenuItem>
      </MenuList>
    </Menu>
  );
}
