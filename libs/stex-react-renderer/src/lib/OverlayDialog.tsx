import { OpenInNew } from '@mui/icons-material';
import { Box, Button, Dialog, DialogActions, IconButton } from '@mui/material';
import { getChildrenOfBodyNode } from '@stex-react/utils';
import { ReactNode, useContext, useState } from 'react';
import { ContentFromUrl } from './ContentFromUrl';
import { ErrorBoundary } from './ErrorBoundary';
import { ServerLinksContext } from './stex-react-renderer';

export interface OverlayDialogProps {
  contentUrl: string;
  displayNode: ReactNode;
}

export function OverlayDialog({ contentUrl, displayNode }: OverlayDialogProps) {
  const [open, setOpen] = useState(false);
  const {mmtUrl} = useContext(ServerLinksContext);

  return (
    <ErrorBoundary hidden={false}>
      <div style={{ display: 'inline' }} onClick={() => setOpen(true)}>
        {displayNode}
      </div>
      <Dialog onClose={() => setOpen(false)} open={open} maxWidth="lg">
        <Box display="flex" flexDirection="column" m="5px" maxWidth="800px">
          <a
            style={{ marginLeft: 'auto' }}
            href={`${mmtUrl}/${contentUrl}`}
            target="_blank"
            rel="noreferrer"
          >
            <IconButton>
              <OpenInNew />
            </IconButton>
          </a>
          <ContentFromUrl
            url={contentUrl}
            modifyRendered={getChildrenOfBodyNode}
          />

          <DialogActions sx={{ p: '0' }}>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </ErrorBoundary>
  );
}
