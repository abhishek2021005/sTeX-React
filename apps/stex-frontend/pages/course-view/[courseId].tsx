import ArticleIcon from '@mui/icons-material/Article';
import MergeIcon from '@mui/icons-material/Merge';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';
import {
  Box,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from '@mui/material';
import { ContentWithHighlight } from '@stex-react/stex-react-renderer';
import { localStore } from '@stex-react/utils';
import axios from 'axios';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { SlideDeck } from '../../components/SlideDeck';
import { SlideDeckNavigation } from '../../components/SlideDeckNavigation';
import { VideoDisplay } from '../../components/VideoDisplay';
import MainLayout from '../../layouts/MainLayout';
import { CourseInfo, DeckAndVideoInfo, Slide } from '../../shared/slides';

const W = typeof window === 'undefined' ? undefined : window;

function RenderElements({ elements }: { elements: string[] }) {
  return (
    <>
      {elements.map((e, idx) => (
        <ContentWithHighlight key={idx} mmtHtml={e} />
      ))}
    </>
  );
}

enum ViewMode {
  SLIDE_MODE = 'SLIDE_MODE',
  VIDEO_MODE = 'VIDEO_MODE',
  COMBINED_MODE = 'COMBINED_MODE',
}
function ToggleModeButton({
  viewMode,
  updateViewMode,
}: {
  viewMode: ViewMode;
  updateViewMode: (mode: ViewMode) => void;
}) {
  return (
    <ToggleButtonGroup
      value={viewMode}
      exclusive
      onChange={(event, newVal) => {
        if (newVal !== null) updateViewMode(newVal);
      }}
      sx={{ m: '5px 0', border: '1px solid black' }}
    >
      <Tooltip title="Show video">
        <ToggleButton value={ViewMode.VIDEO_MODE}>
          <VideoCameraFrontIcon />
        </ToggleButton>
      </Tooltip>
      <Tooltip title="Show slides">
        <ToggleButton value={ViewMode.SLIDE_MODE}>
          <SlideshowIcon />
        </ToggleButton>
      </Tooltip>
      <Tooltip title="Show slides and video">
        <ToggleButton value={ViewMode.COMBINED_MODE}>
          <MergeIcon />
        </ToggleButton>
      </Tooltip>
    </ToggleButtonGroup>
  );
}

const CourseViewPage: NextPage = () => {
  const router = useRouter();
  const courseId = router.query.courseId as string;

  const [selectedDeckId, setSelectedDeckId] = useState('initial');
  const [fromLastSlide, setFromLastSlide] = useState(false);
  const [preNotes, setPreNotes] = useState([] as string[]);
  const [postNotes, setPostNotes] = useState([] as string[]);
  const [offset, setOffset] = useState(64);
  const [courseInfo, setCourseInfo] = useState(undefined as CourseInfo);
  const [deckInfo, setDeckInfo] = useState(undefined as DeckAndVideoInfo);
  const [viewMode, setViewMode] = useState(ViewMode.SLIDE_MODE);
  useEffect(
    () =>
      setViewMode(
        ViewMode[localStore?.getItem('defaultMode') as keyof typeof ViewMode] ||
          ViewMode.SLIDE_MODE
      ),
    []
  );

  useEffect(() => {
    if (!router.isReady) return;
    axios.get(`/api/get-course-info/${courseId}`).then((r) => {
      setCourseInfo(r.data);
    });
  }, [router.isReady, courseId]);

  useEffect(() => {
    for (const section of courseInfo?.sections || []) {
      for (const deck of section.decks) {
        if (deck.deckId === selectedDeckId) {
          setDeckInfo(deck);
          return;
        }
      }
    }
    setDeckInfo(undefined);
  }, [courseInfo, selectedDeckId]);

  useEffect(() => {
    const onScroll = () => setOffset(Math.max(64 - (W?.pageYOffset || 0), 0));
    // clean up code
    window.removeEventListener('scroll', onScroll);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function findCurrentLocation() {
    for (const [secIdx, section] of courseInfo?.sections?.entries() || [])
      for (const [deckIdx, deck] of section.decks.entries())
        if (deck.deckId === selectedDeckId) return { secIdx, deckIdx };
    return { secIdx: undefined, deckIdx: undefined };
  }

  function goToPrevSection() {
    const { secIdx, deckIdx } = findCurrentLocation();
    if (secIdx === undefined || deckIdx === undefined) return;
    if (deckIdx !== 0) {
      setSelectedDeckId(courseInfo.sections[secIdx].decks[deckIdx - 1].deckId);
      setFromLastSlide(true);
      return;
    }
    if (secIdx === 0) return;
    const prevDecks = courseInfo.sections[secIdx - 1].decks;
    setSelectedDeckId(prevDecks[prevDecks.length - 1].deckId);
    setFromLastSlide(true);
  }

  function goToNextSection() {
    const { secIdx, deckIdx } = findCurrentLocation();
    if (secIdx === undefined || deckIdx === undefined) return;
    const currSectionDecks = courseInfo.sections[secIdx].decks;
    if (deckIdx < currSectionDecks.length - 1) {
      setSelectedDeckId(currSectionDecks[deckIdx + 1].deckId);
      setFromLastSlide(false);
      return;
    }
    // last section is the "dummy" section. dont switch to that.
    if (secIdx >= courseInfo.sections.length - 2) return;
    const nextDecks = courseInfo.sections[secIdx + 1].decks;
    setSelectedDeckId(nextDecks[0].deckId);
    setFromLastSlide(false);
  }

  return (
    <MainLayout>
      <Box display="flex">
        <Box flexBasis="600px" flexGrow={1} overflow="hidden">
          <Box maxWidth="800px" margin="auto">
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <ToggleModeButton
                viewMode={viewMode}
                updateViewMode={(mode) => {
                  setViewMode(mode);
                  localStore?.setItem('defaultMode', ViewMode[mode]);
                }}
              />
              <Link
                href="/browser/%3AsTeX%2Fdocument%3Farchive%3DMiKoMH%2FAI%26filepath%3Dcourse%2Fnotes%2Fnotes.xhtml"
                passHref
              >
                <Button size="small" variant="contained" sx={{ mr: '10px' }}>
                  Notes&nbsp;
                  <ArticleIcon />
                </Button>
              </Link>
            </Box>
            {(viewMode === ViewMode.VIDEO_MODE ||
              viewMode === ViewMode.COMBINED_MODE) && (
              <VideoDisplay deckInfo={deckInfo} />
            )}
            {(viewMode === ViewMode.SLIDE_MODE ||
              viewMode === ViewMode.COMBINED_MODE) && (
              <SlideDeck
                courseId={courseId}
                navOnTop={viewMode === ViewMode.COMBINED_MODE}
                deckInfo={deckInfo}
                onSlideChange={(slide: Slide) => {
                  setPreNotes(slide?.preNotes || []);
                  setPostNotes(slide?.postNotes || []);
                }}
                goToNextSection={goToNextSection}
                goToPrevSection={goToPrevSection}
                fromLastSlide={fromLastSlide}
              />
            )}
            <hr />

            {viewMode !== ViewMode.VIDEO_MODE && (
              <Box p="5px">
                <RenderElements elements={preNotes} />
                {preNotes.length > 0 && postNotes.length > 0 && <hr />}
                <RenderElements elements={postNotes} />
              </Box>
            )}
          </Box>
        </Box>
        <Box flexBasis="200px" maxWidth="300px" flexGrow={1} overflow="auto">
          <SlideDeckNavigation
            sections={courseInfo?.sections || []}
            selected={selectedDeckId}
            topOffset={offset}
            onSelect={(i) => {
              setSelectedDeckId(i);
              setFromLastSlide(false);
              setPreNotes([]);
              setPostNotes([]);
            }}
          />
        </Box>
      </Box>
    </MainLayout>
  );
};

export default CourseViewPage;
