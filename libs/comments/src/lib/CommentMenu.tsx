import BlockIcon from '@mui/icons-material/Block';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ShieldTwoToneIcon from '@mui/icons-material/ShieldTwoTone';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Dialog, IconButton, Menu, MenuItem } from '@mui/material';
import { ReactNode, useState } from 'react';
import {
  deleteComment,
  updateCommentState,
  Comment,
  HiddenStatus,
  isHiddenNotSpam,
  isSpam,
} from '@stex-react/api';
import { ConfirmDialogContent } from '@stex-react/react-utils';
import { HideDialogContent } from './HideDialogContent';
import EditIcon from '@mui/icons-material/Edit';

const P_DELETE = 'delete';
const P_HIDE = 'hide';
export interface HiddenState {
  hiddenStatus: HiddenStatus;
  hiddenJustification: string;
}
export function MenuItemAndDialog({
  menuContent,
  dialogContentCreator,
  onClose,
}: {
  menuContent: ReactNode;
  dialogContentCreator: (onClose1: (val: any) => void) => ReactNode;
  onClose: (val: any) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <MenuItem onClick={() => setOpen(true)}>{menuContent}</MenuItem>
      <Dialog
        onClose={() => {
          setOpen(false);
          onClose(null);
        }}
        open={open}
      >
        {dialogContentCreator((val: any) => {
          setOpen(false);
          onClose(val);
        })}
      </Dialog>
    </>
  );
}

export interface HideData {
  forSpam: boolean;
  forUnhide: boolean;
}

export function CommentMenu({
  comment,
  canModerate,
  canEditComment,
  setEditingComment,
  onDelete,
}: {
  comment: Comment;
  canModerate: boolean;
  canEditComment: boolean;
  setEditingComment: any;
  onDelete: () => void;
}) {
  // menu crap start
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  // menu crap end

  const hiddenOrSpam =
    isHiddenNotSpam(comment.hiddenStatus) || isSpam(comment.hiddenStatus);
  const canHideComment = canModerate && !hiddenOrSpam;

  const canUnhideComment = canModerate && hiddenOrSpam;

  function deleteCommentIfConfirmed(confirmed?: boolean) {
    if (!confirmed) return;
    // asyncState.startProcess(P_DELETE);
    deleteComment(comment.commentId).then(
      (_success) => {
        // asyncState.endProcess(P_DELETE);
        onDelete();
      },
      (err) => alert('Failed to delete comment')
      //(err) => asyncState.failProcess(err, 'Failed to delete comment', P_DELETE)
    );
  }

  function updateHiddenState(state: HiddenState) {
    if (!state) {
      return;
    }
    //asyncState.startProcess(P_HIDE);
    updateCommentState(
      comment.commentId,
      state.hiddenStatus,
      state.hiddenJustification
    ).then(
      (success) => {
        // asyncState.endProcess(P_HIDE);
      },
      (err) => alert('Failed to update comment')
      //(err) => asyncState.failProcess(err, 'Failed to update comment', P_HIDE)
    );
  }

  const moderatorIcon = canModerate ? (
    <sup>
      <ShieldTwoToneIcon sx={{ fontSize: '14px' }} />
    </sup>
  ) : null;
  return (
    <div style={{ display: 'inline', float: 'right' }}>
      <IconButton
        id="options-menu"
        sx={{ p: '0px 12px' }}
        onClick={handleClick}
        size="small"
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu
        id="comment-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{ 'aria-labelledby': 'basic-button' }}
      >
        {canEditComment && (
          <MenuItem
            onClick={() => {
              setEditingComment(true);
            }}
          >
            <EditIcon />
            &nbsp;Edit
          </MenuItem>
        )}
        {canEditComment && (
          <MenuItemAndDialog
            menuContent={
              <>
                <DeleteIcon />
                &nbsp;Delete
              </>
            }
            dialogContentCreator={(onClose: (confirmed: boolean) => void) => (
              <ConfirmDialogContent
                textContent="Are you sure you want to delete this comment?"
                title="Delete Comment"
                okText="Delete"
                onClose={onClose}
              />
            )}
            onClose={(v) => {
              handleClose();
              deleteCommentIfConfirmed(v);
            }}
          />
        )}

        {canHideComment && (
          <MenuItemAndDialog
            menuContent={
              <>
                <VisibilityOffIcon />
                &nbsp;Hide Below
                {moderatorIcon}
              </>
            }
            dialogContentCreator={(onClose: (state?: HiddenState) => void) => (
              <HideDialogContent
                forSpam={false}
                forUnhide={false}
                onClose={onClose}
              />
            )}
            onClose={(state) => {
              handleClose();
              updateHiddenState(state);
            }}
          />
        )}
        {canUnhideComment && (
          <MenuItemAndDialog
            menuContent={
              <>
                <VisibilityIcon />
                &nbsp;Unhide
                {moderatorIcon}
              </>
            }
            dialogContentCreator={(onClose: (state?: HiddenState) => void) => (
              <HideDialogContent
                forSpam={false}
                forUnhide={true}
                onClose={onClose}
              />
            )}
            onClose={(state) => {
              handleClose();
              updateHiddenState(state);
            }}
          />
        )}
        {canHideComment && (
          <MenuItemAndDialog
            menuContent={
              <>
                <BlockIcon />
                &nbsp;Spam
                {moderatorIcon}
              </>
            }
            dialogContentCreator={(onClose: (state?: HiddenState) => void) => (
              <HideDialogContent
                forSpam={true}
                forUnhide={false}
                onClose={onClose}
              />
            )}
            onClose={(state) => {
              handleClose();
              updateHiddenState(state);
            }}
          />
        )}
      </Menu>
    </div>
  );
}
