import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import IndeterminateCheckBoxOutlinedIcon from '@mui/icons-material/IndeterminateCheckBoxOutlined';
import UnfoldLessDoubleIcon from '@mui/icons-material/UnfoldLessDouble';
import UnfoldMoreDoubleIcon from '@mui/icons-material/UnfoldMoreDouble';
import { Box, IconButton, TextField, Tooltip } from '@mui/material';
import {
  SectionsAPIData,
  getCourseId,
  getCourseInfo,
  getDocumentSections,
  getUserInfo,
  isModerator,
} from '@stex-react/api';
import {
  CourseInfo,
  CoverageTimeline,
  convertHtmlStringToPlain,
  createHash,
  getSectionInfo,
  localStore,
} from '@stex-react/utils';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { FixedPositionMenu } from './LayoutWithFixedMenu';
import {
  TOCFileNode,
  TOCNode,
  TOCNodeType,
  TOCSectionNode,
} from './collectIndexInfo';
import { getLocaleObject } from './lang/utils';
import { ServerLinksContext } from './stex-react-renderer';
import styles from './stex-react-renderer.module.scss';

interface SectionTreeNode {
  parentNode?: SectionTreeNode;
  children: SectionTreeNode[];
  tocNode: TOCSectionNode;
}

function markPreviousAsCovered(node: SectionTreeNode, selfCovered: boolean) {
  if (selfCovered) {
    if (!node.tocNode) return; // TODO: Fix this properly
    node.tocNode.isCovered = true;
  }
  const parent = node.parentNode;
  if (!parent) return;
  const idx = parent.children.findIndex(
    (c) => c.tocNode.id === node.tocNode.id
  );
  if (idx === -1) {
    console.log(node.tocNode.id);
    console.log(parent.children.map((c) => c.tocNode.id));
    console.log('oh ohhh');
    return;
  }
  for (const c of parent.children) {
    if (c.tocNode.id === node.tocNode.id) break;
    markPreviousAsCovered(c, true);
  }
  markPreviousAsCovered(
    parent,
    selfCovered && idx === parent.children.length - 1
  );
}

function fillCoverage(node: SectionTreeNode, coveredUntil: string) {
  if (!node) return;
  const value = convertHtmlStringToPlain(node.tocNode?.title);
  if (value === coveredUntil) {
    markPreviousAsCovered(node, true);
    return;
  }
  if (!node.children) return;
  for (const c of node.children) fillCoverage(c, coveredUntil);
}

function getSectionTree(
  tocNode: TOCNode,
  parentNode?: SectionTreeNode
): SectionTreeNode | SectionTreeNode[] {
  const isSection = tocNode.type === TOCNodeType.SECTION;

  if (isSection) {
    const children: SectionTreeNode[] = [];
    const thisNode = {
      tocNode: tocNode as TOCSectionNode,
      children,
      parentNode,
    };
    for (const s of tocNode.childNodes.values()) {
      const subNodes = getSectionTree(s, thisNode);
      if (!subNodes) continue;
      if (Array.isArray(subNodes)) children.push(...subNodes);
      else children.push(subNodes);
    }
    return thisNode;
  } else {
    const children: SectionTreeNode[] = [];
    for (const s of tocNode.childNodes.values()) {
      const subNodes = getSectionTree(s, parentNode);
      if (!subNodes) continue;
      if (Array.isArray(subNodes)) children.push(...subNodes);
      else children.push(subNodes);
    }
    return children;
  }
}

function applyFilterOne(
  node?: SectionTreeNode,
  searchTerms?: string[]
): SectionTreeNode | undefined {
  if (!node || !searchTerms?.length) return node;
  const newChildren: SectionTreeNode[] = [];
  for (const childNode of node.children) {
    const newChild = applyFilterOne(childNode, searchTerms);
    if (newChild) newChildren.push(newChild);
  }
  const matchesThisNode = searchTerms.some((term) =>
    node.tocNode.title.toLowerCase().includes(term)
  );
  if (newChildren.length === 0 && !matchesThisNode) {
    return undefined;
  }
  return {
    parentNode: node.parentNode,
    children: newChildren,
    tocNode: node.tocNode,
  };
}

function applyFilter(
  nodes?: SectionTreeNode[],
  searchTerms?: string[]
): SectionTreeNode[] | undefined {
  if (!nodes || !searchTerms?.length) return nodes;
  return nodes
    .map((n) => applyFilterOne(n, searchTerms))
    .filter((n) => n) as any;
}

function RenderTree({
  node,
  level,
  defaultOpen,
  selectedSection,
  onSectionClick,
}: {
  node: SectionTreeNode;
  level: number;
  defaultOpen: boolean;
  selectedSection: string;
  onSectionClick?: (sectionId: string) => void;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  useEffect(() => {
    setIsOpen(defaultOpen);
  }, [defaultOpen]);

  const itemClassName =
    level === 0 ? styles['level0_dashboard_item'] : styles['dashboard_item'];
  const isSelected = selectedSection === node.tocNode.id;
  return (
    <Box
      key={node.tocNode.id}
      sx={{
        py: '6px',
        backgroundColor: node.tocNode.isCovered ? '#FFB' : undefined,
      }}
    >
      <Box
        display="flex"
        ml={node.children.length > 0 ? undefined : '23px'}
        fontWeight={isSelected ? 'bold' : undefined}
      >
        {node.children.length > 0 && (
          <IconButton
            sx={{ color: 'gray', p: '0', mr: '3px' }}
            onClick={() => setIsOpen((v) => !v)}
          >
            {isOpen ? (
              <IndeterminateCheckBoxOutlinedIcon sx={{ fontSize: '20px' }} />
            ) : (
              <AddBoxOutlinedIcon sx={{ fontSize: '20px' }} />
            )}
          </IconButton>
        )}
        <span
          className={itemClassName}
          style={{
            cursor: 'pointer',
            color: isSelected ? 'black' : undefined,
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (onSectionClick) {
              onSectionClick(node.tocNode.id);
              return;
            }
            const paths: string[] = [];
            let n: TOCNode | undefined = node.tocNode;
            while (n?.parentNode) {
              const hash = (n as any)?.hash;
              if (hash) paths.push(hash);
              // console.log(hash);
              n = n.parentNode;
            }
            if (router) {
              const inDocPath =
                paths.reverse().join('.') + '~' + node.tocNode.id;
              const fileId = router.query['id'] || router.query['courseId'];
              localStore?.setItem(`inDocPath-${fileId}`, inDocPath);
              router.push({ query: { ...router.query, inDocPath } });
            }
          }}
        >
          {convertHtmlStringToPlain(node.tocNode.title)}
        </span>
      </Box>
      {isOpen && node.children.length > 0 && (
        <Box display="flex" ml="3px">
          <Box
            minWidth="12px"
            sx={{
              cursor: 'pointer',
              '&:hover *': { borderLeft: '1px solid #333' },
            }}
            onClick={() => setIsOpen((v) => !v)}
          >
            <Box width="0" m="auto" borderLeft="1px solid #CCC" height="100%">
              &nbsp;
            </Box>
          </Box>
          <Box>
            {(node.children || []).map((child) => (
              <RenderTree
                key={child.tocNode.id}
                node={child}
                level={level + 1}
                defaultOpen={defaultOpen}
                selectedSection={selectedSection}
                onSectionClick={onSectionClick}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}

export function getDocumentTree(
  data: SectionsAPIData,
  parentNode?: TOCNode
): TOCNode {
  const { children, archive, filepath, id, title } = data;
  const isFileNode = archive && filepath;
  let node: TOCNode | undefined = undefined;
  const childNodes = new Map<string, TOCNode>();
  if (isFileNode) {
    const hash = createHash({ archive, filepath });
    node = {
      type: TOCNodeType.FILE,
      parentNode,
      childNodes,

      hash,
      archive,
      filepath,
    } as TOCFileNode;
  } else {
    node = {
      type: TOCNodeType.SECTION,
      parentNode,
      childNodes,

      id,
      title,
    } as TOCSectionNode;
  }

  (children || []).forEach((c) => {
    const cNode = getDocumentTree(c, node) as any;
    childNodes.set(cNode.id || cNode.hash, cNode);
  });
  return node;
}

export function ContentDashboard({
  contentUrl,
  docSections,
  selectedSection,
  onClose,
  onSectionClick,
}: {
  contentUrl: string;
  docSections: SectionsAPIData | undefined;
  selectedSection: string;
  onClose: () => void;
  onSectionClick?: (sectionId: string) => void;
}) {
  const t = getLocaleObject(useRouter());
  const [filterStr, setFilterStr] = useState('');
  const [defaultOpen, setDefaultOpen] = useState(true);
  const { mmtUrl } = useContext(ServerLinksContext);
  const [coveredUntil, setCoveredUntilSection] = useState('');
  const [covUpdateLink, setCovUpdateLink] = useState<string | undefined>(
    undefined
  );
  const [courses, setCourses] = useState<{ [id: string]: CourseInfo }>({});

  const root = docSections ? getDocumentTree(docSections, undefined): undefined;
  const dashInfo = root?.type !== TOCNodeType.FILE ? undefined : root;

  useEffect(() => {
    if (mmtUrl) getCourseInfo(mmtUrl).then(setCourses);
  }, [mmtUrl]);

  useEffect(() => {
    getUserInfo().then((info) => {
      if (!info?.userId || !isModerator(info.userId)) {
        setCovUpdateLink(undefined);
        return;
      }
      const { archive, filepath } = getSectionInfo(contentUrl);
      for (const courseId of Object.keys(courses)) {
        const { notesArchive, notesFilepath } = courses[courseId];
        if (archive === notesArchive && filepath === notesFilepath) {
          setCovUpdateLink(`/coverage-update?courseId=${courseId}`);
        }
      }
    });
  }, [contentUrl, courses]);

  useEffect(() => {
    async function getCoverageInfo() {
      const courseId = await getCourseId(mmtUrl, getSectionInfo(contentUrl));
      if (!courseId) return;

      const resp = await axios.get('/api/get-coverage-timeline');
      const snaps = (resp.data as CoverageTimeline)?.[courseId];
      if (snaps?.length) {
        setCoveredUntilSection(snaps[snaps.length - 1].sectionName);
      }
    }
    getCoverageInfo();
  }, [mmtUrl, contentUrl]);

  const shadowTopLevel = { children: [] as any, tocNode: undefined as any };
  const firstLevelSections =
    dashInfo &&
    applyFilter(
      getSectionTree(dashInfo, shadowTopLevel) as SectionTreeNode[],
      filterStr
        .toLowerCase()
        .split(' ')
        .map((s) => s.trim())
        .filter((t) => !!t?.length)
    );
  if (firstLevelSections) shadowTopLevel.children = firstLevelSections;
  if (coveredUntil?.length) fillCoverage(shadowTopLevel, coveredUntil);

  return (
    <FixedPositionMenu
      staticContent={
        <>
          <Box display="flex" alignItems="center" sx={{ m: '5px' }}>
            <IconButton sx={{ m: '2px' }} onClick={() => onClose()}>
              <CloseIcon />
            </IconButton>
            <TextField
              id="tree-filter-string"
              label={t.search}
              value={filterStr}
              onChange={(e) => setFilterStr(e.target.value)}
              sx={{ mx: '5px', width: '100%' }}
              size="small"
            />
          </Box>
          <Box display="flex" justifyContent="space-between" m="5px 10px">
            <Tooltip title={t.expandCollapseAll}>
              <IconButton
                onClick={() => setDefaultOpen((v) => !v)}
                sx={{ border: '1px solid #CCC', borderRadius: '40px' }}
              >
                {defaultOpen ? (
                  <UnfoldLessDoubleIcon />
                ) : (
                  <UnfoldMoreDoubleIcon />
                )}
              </IconButton>
            </Tooltip>
            {covUpdateLink?.length && (
              <a href={covUpdateLink} target="_blank" rel="noreferrer">
                <IconButton>
                  <EditIcon />
                </IconButton>
              </a>
            )}{' '}
            {/*<RendererDisplayOptions /> removed - as requested by Dennis*/}
          </Box>
        </>
      }
    >
      {(firstLevelSections || []).map((child) => (
        <RenderTree
          key={child.tocNode.id}
          node={child}
          level={0}
          defaultOpen={defaultOpen}
          onSectionClick={onSectionClick}
          selectedSection={selectedSection}
        />
      ))}
    </FixedPositionMenu>
  );
}
