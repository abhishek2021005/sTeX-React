import React, { useEffect, useState } from 'react';
import { List, ListItem, ListItemText, Button, Typography, Box, Paper } from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';
import { useRouter } from 'next/router';
import axios from 'axios';
import { PRIMARY_COL } from '@stex-react/utils';

interface Node {
  id: string;
  title: string;
  archive?: string;
  filepath?: string;
  children?: Node[];
}

interface ProblemCounts {
  [key: string]: number;
}

interface ProblemListProps {
  data: Node;
  courseId: string;
}

const removeHtmlTags = (html: string): string => {
  if (!html || html.trim() === '') {
    return 'Untitled';
  }

  if (/^<[^>]+>$/.test(html.trim())) {
    return 'Untitled';
  }

  if (!/<[^>]+>/.test(html)) {
    return html.trim();
  }

  return html.replace(/<\/?[^>]+>/gi, '').trim();
};

const extractTitlesAndMetadata = (
  node: Node,
  level = 0,
  parentArchive: string | null = null,
  parentFilepath: string | null = null
): Array<{
  title: string;
  archive: string | null;
  filepath: string | null;
  id: string;
  level: number;
}> => {
  if (!node) return [];

  let result: Array<{
    title: string;
    archive: string | null;
    filepath: string | null;
    id: string;
    level: number;
  }> = [];
  const currentArchive = node.archive || parentArchive;
  const currentFilepath = node.filepath || parentFilepath;

  if (node.title === '' || node.title) {
    const cleanTitle = removeHtmlTags(node.title);
    result.push({
      title: cleanTitle,
      archive: currentArchive,
      filepath: currentFilepath,
      id: node.id,
      level: level,
    });
  }

  if (Array.isArray(node.children)) {
    node.children.forEach((child) => {
      result = result.concat(
        extractTitlesAndMetadata(child, level + 1, currentArchive, currentFilepath)
      );
    });
  }

  return result;
};

const ProblemList: React.FC<ProblemListProps> = ({ data, courseId }) => {
  const [problemCounts, setProblemCounts] = useState<ProblemCounts>({});
  const router = useRouter();

  const titlesAndMetadata = data ? extractTitlesAndMetadata(data) : [];

  useEffect(() => {
    if (!courseId) return;

    axios
      .get(`/api/get-course-problem-counts/${courseId}`)
      .then((resp) => {
        setProblemCounts(resp.data);
      })
      .catch((error) => {
        console.error('Error fetching problem counts:', error);
      });
  }, [courseId]);

  const handleButtonClick = (archive: string | null, filepath: string | null, title: string) => {
    router.push({
      pathname: '/per-section-quiz',
      query: { archive, filepath, title, courseId },
    });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        padding: 2,
        position: 'relative',
      }}
    >
      <Typography
        variant="h3"
        sx={{
          mb: 3,
          textAlign: 'center',
          color: '#203360',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
        }}
      >
        Practice
      </Typography>
      <Paper
        sx={{
          padding: 3,
          borderRadius: 2,
          boxShadow: 3,
          width: '100%',
          maxWidth: 600,
          maxHeight: '80vh',
          overflowY: 'auto',
          textAlign: 'left',
        }}
      >
        <List>
          {titlesAndMetadata.map((item, index) => {
            const problemCount = problemCounts[item.id] || 0;

            const isBold = item.level === 2 ? true : false;
            const fontWeight = isBold ? 'bold' : 'normal';
            const fontFamily = isBold ? 'Times New Roman, serif' : 'sans-serif';
            const variant = item.level === 2 ? 'h5' : 'h8';

            if (item.level === 2 || item.level === 4) {
              return (
                <ListItem
                  key={index}
                  sx={{
                    paddingLeft: `${item.level * 20}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#f9f9f9',
                    borderRadius: 1,
                    marginBottom: 1,
                    transition: 'background-color 0.3s ease',
                    '&:hover': {
                      backgroundColor: '#e0e0e0',
                    },
                  }}
                >
                  <Box sx={{ flexGrow: 1 }}>
                    <ListItemText
                      primary={
                        <>
                          <Typography
                            variant={variant}
                            component="div"
                            color={PRIMARY_COL}
                            sx={{
                              fontWeight,
                              fontFamily,
                            }}
                          >
                            {item.title}
                          </Typography>
                          {problemCount >= 0 && (
                            <Typography
                              component="div"
                              variant="body2"
                              sx={{
                                color: 'grey',
                                fontSize: '0.9rem',
                                marginTop: '4px',
                                fontWeight: 300,
                              }}
                            >
                              {problemCount} problems
                            </Typography>
                          )}
                        </>
                      }
                    />
                  </Box>
                  <Button
                    variant="contained"
                    sx={{
                      fontSize: '0.875rem',
                      minWidth: '127px',
                    }}
                    onClick={() => handleButtonClick(item.archive, item.filepath, item.title)}
                  >
                    <LaunchIcon fontSize="small" sx={{ marginRight: '8px' }} />
                    Practice
                  </Button>
                </ListItem>
              );
            }
            return null;
          })}
        </List>
      </Paper>
    </Box>
  );
};

export default ProblemList;
