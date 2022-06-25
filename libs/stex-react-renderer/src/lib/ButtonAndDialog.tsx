import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { useState } from "react";

export function ButtonAndDialog({ content }: any) {
    // Menu crap start
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
      setAnchorEl(null);
    };
    // Menu crap end
  
    return (
      <>
        <IconButton onClick={handleClick}>
          <InfoOutlinedIcon />
        </IconButton>
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            "aria-labelledby": "basic-button",
          }}
        >
          <MenuItem>{content}</MenuItem>
        </Menu>
      </>
    );
  }
