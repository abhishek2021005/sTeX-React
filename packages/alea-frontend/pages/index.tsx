import {
  Box,
  Button,
  Typography,
  useMediaQuery,
  IconButton,
  Tooltip,
} from '@mui/material';
import { PRIMARY_COL } from '@stex-react/utils';
import { NextPage } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import MainLayout from '../layouts/MainLayout';
import { getLocaleObject } from '../lang/utils';

const aleaFeatures = [
  {
    img_url: '/selfpaced.png',
    title: 'Self paced learning',
    description:
      'Empowering students to learn at their own speed, fostering independence and personalized progress.',
  },
  {
    img_url: '/University_Credits.png',
    title: 'Adaptive learning',
    description:
      'Tailoring content and difficulty based on individual student performance, maximizing engagement and comprehension.',
  },
  {
    img_url: '/up.png',
    title: 'See student progress',
    description:
      'Providing real-time insights into student advancement, facilitating targeted support and encouragement.',
  },
  {
    img_url: '/quiz.png',
    title: 'Live Quizzes',
    description:
      'Offering interactive assessments in real-time, promoting active participation and immediate feedback for enhanced learning outcomes.',
  },
];

const partneredUniversities = (router: any) => [
  {
    name: 'FAU',
    logoSrc: '/faulogo.png',
    altText: 'FAU - Logo',
    width: 150,
    height: 150,
    onClick: () => router.push('/u/FAU'),
  },
  {
    name: 'IISC Banglore',
    logoSrc: '/iisc.png',
    altText: 'IISC - Logo',
    width: 140,
    height: 140,
    onClick: () => router.push('/u/IISc'),
  },
  {
    name: 'Jacob',
    logoSrc: '/jacoblogo.png',
    altText: 'Jacob - Logo',
    width: 140,
    height: 140,
    onClick: () => router.push('/u/Jacobs'),
  },
  {
    name: 'Heriot Watt',
    logoSrc: '/heriott_logo.png',
    altText: 'Heriot Watt - Logo',
    width: 130,
    height: 130,
    onClick: () => router.push('/u/Heriot Watt'),
  },
];

const featuredCourses = [
  {
    courseImage: '/ai-1.jpg',
    courseName: 'AI -1',
    professor: 'Prof. Michael Kohlhase',
    courseId: 'ai-1',
  },
  {
    courseImage: '/gdp.png',
    courseName: 'Grundlagen der Programmierung',
    professor: 'Prof. Michael Kohlhase',
    courseId: 'gdp',
  },
  {
    courseImage: '/iwgs-1.jpg',
    courseName: 'IWGS-1',
    professor: 'Prof. Michael Kohlhase',
    courseId: 'iwgs-1',
  },
  {
    courseImage: '/lbs.jpg',
    courseName: 'Logik-Basierte Sprachverarbeitung',
    professor: 'Prof. Michael Kohlhase',
    courseId: 'lbs',
  },
];
const BannerSection = () => {
  const router = useRouter();
  const { home: t } = getLocaleObject(router);
  const isSmallScreen = useMediaQuery('(max-width:660px)');

  return (
    <Box
      sx={{
        margin: '0 auto',
        maxWidth: '1200px',
        display: 'flex',
        alignItems: 'center',
        padding: '100px 0px',
        justifyContent: 'space-around',
      }}
    >
      <Box>
        <Typography
          variant="h1"
          sx={{
            paddingBottom: 2,
            color: PRIMARY_COL,
            fontFamily: 'sans-serif,roboto',
          }}
        >
          Adaptive learning assistant
        </Typography>
        <Typography
          variant="body1"
          width="400px"
          mb="16px"
          fontFamily={'sans-serif,roboto'}
          display="flex"
        >
          Courses that adapt to the users preferences and competencies focused
          on the knowledge conveyed in a particular knowledge unit.
          <Tooltip
            placement="right-start"
            title={
              <Box sx={{ fontSize: 'medium' }}>
                <span style={{ display: 'block' }}>{t.expIconHover1}</span>
                <span>{t.expIconHover2}</span>
              </Box>
            }
          >
            <IconButton
              sx={{ float: 'right', zIndex: 2 }}
              size="large"
              onClick={() => router.push('/exp')}
            >
              <Image
                height={30}
                width={30}
                src="/experiment.svg"
                alt="Experiments"
              />
            </IconButton>
          </Tooltip>
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ marginRight: 1 }}
          onClick={() => router.push('/signup')}
        >
          Sign up now
        </Button>
        <Button variant="outlined" onClick={() => router.push('#courses')}>
          Explore our courses
        </Button>
      </Box>
      {!isSmallScreen && (
        <Image
          style={{ borderRadius: '50%' }}
          src={'/collegestudent.png'}
          width={350}
          height={350}
          alt="profile"
        />
      )}
    </Box>
  );
};

function CourseCard({ key, course }) {
  const { courseImage, courseName, professor, courseId } = course;
  const router = useRouter();
  return (
    <Box
      key={key}
      sx={{
        cursor: 'pointer',
        boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)',
        width: '220px',
        margin: '15px',
        textAlign: 'center',
        height: '260px',
        backgroundColor: 'rgb(237, 237, 237)',
        borderRadius: '2rem',
        padding: '1rem',
        transition: 'transform 0.3s',
        '&:hover': {
          transform: 'scale(1.1)',
        },
      }}
      onClick={() => router.push(`/course-home/${courseId}`)}
    >
      <Image
        height={120}
        width={200}
        src={courseImage}
        alt="couse-image"
        style={{ borderRadius: '10px' }}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', marginTop: '10px' }}>
        <Typography
          sx={{
            fontSize: '18px',
            fontWeight: 'bold',
            padding: '10px',
            color: '#003786',
          }}
        >
          {courseName}
        </Typography>
        <Typography sx={{ fontSize: '14px', padding: '5px' }}>FAU</Typography>
        <Typography sx={{ fontSize: '14px', padding: '5px' }}>
          {professor}
        </Typography>
      </Box>
    </Box>
  );
}
function AleaFeatures({ img_url, title, description }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: '200px',
        flexDirection: 'column',
        margin: '50px 20px',
      }}
    >
      <Image src={img_url} height={80} width={80} alt="University_Credits" />
      <Typography
        sx={{
          fontSize: '18px',
          fontWeight: 'bold',
          marginTop: '15px',
          wordWrap: 'break-word',
          textAlign: 'center',
        }}
      >
        {title}
      </Typography>
      <Typography
        sx={{ fontSize: '12px', color: '#696969', textAlign: 'center' }}
      >
        {description}
      </Typography>
    </Box>
  );
}

const StudentHomePage: NextPage = () => {
  const router = useRouter();
  const universities = partneredUniversities(router);
  return (
    <MainLayout title="Courses | VoLL-KI">
      <Box m="0 auto">
        <BannerSection />
        <Box sx={{ backgroundColor: '#F5F5F5', padding: '80px' }}>
          <Box sx={{ margin: '0 auto', maxWidth: '1200px' }}>
            <Typography
              style={{
                color: '#757575',
                fontWeight: '400',
                fontSize: '20px',
                textAlign: 'center',
              }}
            >
              Partnered with{' '}
              <span style={{ color: PRIMARY_COL }}>Top Institutions</span> to
              produce
              <span style={{ color: ' green' }}>
                {' '}
                Best Quality Education content
              </span>
              .
            </Typography>
            <br />
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around ',
              }}
            >
              {universities.map((university, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <Image
                    src={university.logoSrc}
                    alt={university.altText}
                    width={university.width}
                    height={university.height}
                    style={{ cursor: 'pointer' }}
                    onClick={university.onClick}
                  />
                  <Typography>{university.name}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '300px',
            padding: '20px',
            marginTop: '40px',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '0 auto',
            maxWidth: '1200px',
          }}
        >
          <Typography
            sx={{
              textAlign: 'center',
              fontWeight: 'bold',
              color: PRIMARY_COL,
              fontSize: '24px',
              marginTop: '30px',
            }}
          >
            Why ALeA?
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            {aleaFeatures.map((feature, index) => (
              <AleaFeatures
                key={index}
                img_url={feature.img_url}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '300px',
            padding: '20px',
            marginTop: '40px',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '0 auto',
            maxWidth: '1200px',
          }}
        >
          <Typography
            sx={{
              fontWeight: 'bold',
              color: PRIMARY_COL,
              fontSize: '24px',
              marginTop: '30px',
            }}
          >
            Explore Courses
          </Typography>
          <Box
            id="courses"
            sx={{
              display: 'flex',
              justifyContent: 'space-around',
              marginTop: '40px',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            {featuredCourses.map((course) => (
              <CourseCard key={course.courseId} course={course} />
            ))}
          </Box>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default StudentHomePage;
