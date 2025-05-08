import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  Button,
  Grid,
  GridItem,
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverBody,
  Spinner,
  useColorModeValue,
  Badge,
  Avatar,
  Divider,
  HStack,
  Icon,
  Image,
} from "@chakra-ui/react";
import {
  FiHome,
  FiSend,
  FiFileText,
  FiUsers,
  FiPenTool,
  FiLogOut,
  FiBell,
  FiTrello,
  FiActivity,
  FiTrendingUp,
  FiClock,
} from "react-icons/fi";
import axios from "axios";
import Requests from "./Requests";
import Tasks from "./Tasks";
import Collaborations from "./Collaborations";
import Feedback from "./Feedback";
import MyCollaborationHub from './MyCollaborationHub';
import NotificationBell from "../components/NotificationBell";
import newImage from "../assets/teams.png";

const DashboardHome = () => {
  const [fullName, setFullName] = useState("");
  const [companyID, setCompanyID] = useState("");
  const [statistics, setStatistics] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [collaborations, setCollaborations] = useState([]);
  const navigate = useNavigate();

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.400");
  const cardBg = useColorModeValue("white", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.600");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const companyID = localStorage.getItem("companyID");
    if (!token) return;

    axios
      .get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setFullName(res.data.fullName);
        setCompanyID(res.data.companyID);
      })
      .catch((err) => {
        console.error("Error fetching user profile", err);
      });

    fetchStatistics(companyID);
    fetchNotifications(companyID);
    fetchRecentActivities(companyID);
    fetchCollaborations(companyID);
  }, []);

  const fetchStatistics = async (companyID) => {
    try {
      const [requestsRes, todoRes, incomingRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/requests/pending/${companyID}`),
        axios.get(`http://localhost:5000/api/requests/ongoing/${companyID}`),
        axios.get(`http://localhost:5000/api/requests/assigned/${companyID}`),
      ]);

      setStatistics({
        requestsMade: requestsRes.data.length,
        todoTasks: todoRes.data.length,
        incomingRequests: incomingRes.data.length,
      });
    } catch (err) {
      console.error("Error fetching statistics", err);
    }
  };

  const fetchNotifications = async (companyID) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/requests/assigned/${companyID}`);
      setNotifications(res.data.slice(0, 5));
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

  const fetchRecentActivities = async (companyID) => {
    try {
       // Fetch both in parallel(sahan changes)
       const [ongoingRes, declinedRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/requests/ongoing/${companyID}`),
        axios.get(`http://localhost:5000/api/requests/declined/${companyID}`)
      ]);

      // Merge, sort by updatedAt desc, take top 10
      const merged = [
        ...ongoingRes.data,
        ...declinedRes.data
      ]
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 10);

      setRecentActivities(merged);
    } catch (err) {
      console.error("Error fetching recent activities", err);
    }
  };


  const fetchCollaborations = async (companyID) => {
    try {
      const res = await axios.get("http://localhost:5000/api/collaborations");
      const filteredCollaborations = res.data.filter(
        (collaboration) =>
          collaboration.assignedBy === companyID || collaboration.assignee === companyID
      );
      setCollaborations(filteredCollaborations);
    } catch (err) {
      console.error("Error fetching collaborations", err);
    }
  };

  return (
    <Box 
      p="8" 
      minH="100vh"
      position="relative"
      overflow="hidden"
    >
      {/* Background Image */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        zIndex="0"
      >
        <Image
          src={newImage}
          alt="Dashboard Background"
          objectFit="cover"
          width="100%"
          height="100%"
        />
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg={useColorModeValue("rgba(255, 255, 255, 0.7)", "rgba(17, 24, 39, 0.7)")}
        />
      </Box>

      {/* Content Container */}
      <Box position="relative" zIndex="1">
        <Flex justify="space-between" align="center" mb="8">
          <HStack spacing="4">
            <Avatar
              size="lg"
              name={fullName}
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=2563eb&color=fff`}
            />
            <Box>
              <Heading size="lg" color={useColorModeValue("gray.700", "white")}>
                Welcome back, {fullName}
                {companyID && (
                  <Badge ml="2" colorScheme="blue" fontSize="sm">
                    {companyID}
                  </Badge>
                )}
              </Heading>
              <Text color={textColor} mt="1">
                Here's what's happening with your tasks
              </Text>
            </Box>
          </HStack>
          <HStack spacing="4">
            <NotificationBell companyID={companyID} />
          </HStack>
        </Flex>

        <Grid templateColumns="repeat(3, 1fr)" gap={6} mb="8">
          <GridItem>
            <Box
              p="6"
              bg={cardBg}
              borderRadius="xl"
              boxShadow="sm"
              border="1px"
              borderColor={borderColor}
              _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
              transition="all 0.2s"
              position="relative"
              overflow="hidden"
            >
              <Box
                position="absolute"
                top="0"
                right="0"
                w="100px"
                h="100px"
                bgGradient="linear(to-br, blue.400, blue.600)"
                opacity="0.1"
                borderRadius="full"
                transform="translate(30%, -30%)"
              />
              <HStack spacing="4" mb="4" position="relative">
                <Icon as={FiTrendingUp} boxSize="6" color="blue.500" />
                <Heading size="md" color={textColor}>Requests Made</Heading>
              </HStack>
              <Text fontSize="3xl" fontWeight="bold" color="blue.500" position="relative">
                {statistics.requestsMade}
              </Text>
            </Box>
          </GridItem>
          <GridItem>
            <Box
              p="6"
              bg={cardBg}
              borderRadius="xl"
              boxShadow="sm"
              border="1px"
              borderColor={borderColor}
              _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
              transition="all 0.2s"
              position="relative"
              overflow="hidden"
            >
              <Box
                position="absolute"
                top="0"
                right="0"
                w="100px"
                h="100px"
                bgGradient="linear(to-br, green.400, green.600)"
                opacity="0.1"
                borderRadius="full"
                transform="translate(30%, -30%)"
              />
              <HStack spacing="4" mb="4" position="relative">
                <Icon as={FiFileText} boxSize="6" color="green.500" />
                <Heading size="md" color={textColor}>To-do Tasks</Heading>
              </HStack>
              <Text fontSize="3xl" fontWeight="bold" color="green.500" position="relative">
                {statistics.todoTasks}
              </Text>
            </Box>
          </GridItem>
          <GridItem>
            <Box
              p="6"
              bg={cardBg}
              borderRadius="xl"
              boxShadow="sm"
              border="1px"
              borderColor={borderColor}
              _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
              transition="all 0.2s"
              position="relative"
              overflow="hidden"
            >
              <Box
                position="absolute"
                top="0"
                right="0"
                w="100px"
                h="100px"
                bgGradient="linear(to-br, purple.400, purple.600)"
                opacity="0.1"
                borderRadius="full"
                transform="translate(30%, -30%)"
              />
              <HStack spacing="4" mb="4" position="relative">
                <Icon as={FiBell} boxSize="6" color="purple.500" />
                <Heading size="md" color={textColor}>Incoming Request</Heading>
              </HStack>
              <Text fontSize="3xl" fontWeight="bold" color="purple.500" position="relative">
                {statistics.incomingRequests}
              </Text>
            </Box>
          </GridItem>
        </Grid>

        <Grid templateColumns="repeat(2, 1fr)" gap={6}>
          <GridItem>
            <Box
              p="6"
              bg={cardBg}
              borderRadius="xl"
              boxShadow="sm"
              border="1px"
              borderColor={borderColor}
              mb="6"
              position="relative"
              overflow="hidden"
            >
              <Box
                position="absolute"
                top="0"
                right="0"
                w="150px"
                h="150px"
                bgGradient="linear(to-br, blue.400, blue.600)"
                opacity="0.05"
                borderRadius="full"
                transform="translate(30%, -30%)"
              />
              <HStack spacing="4" mb="4" position="relative">
                <Icon as={FiUsers} boxSize="6" color="blue.500" />
                <Heading size="md" color={textColor}>Your Collaborations</Heading>
              </HStack>
              <VStack align="stretch" spacing="4">
                {collaborations.map((collaboration, index) => (
                  <Box
                    key={index}
                    p="4"
                    bg={hoverBg}
                    borderRadius="lg"
                    _hover={{ transform: "translateX(4px)" }}
                    transition="all 0.2s"
                  >
                    <Text fontWeight="medium">{collaboration.taskName}</Text>
                    <Text fontSize="sm" color={textColor}>
                      {collaboration.assignedBy === companyID ? "Requested By You" : "Accepted By You"}
                    </Text>
                  </Box>
                ))}
              </VStack>
            </Box>

            <Box
              p="6"
              bg={cardBg}
              borderRadius="xl"
              boxShadow="sm"
              border="1px"
              borderColor={borderColor}
              position="relative"
              overflow="hidden"
            >
              <Box
                position="absolute"
                top="0"
                right="0"
                w="150px"
                h="150px"
                bgGradient="linear(to-br, green.400, green.600)"
                opacity="0.05"
                borderRadius="full"
                transform="translate(30%, -30%)"
              />
              <HStack spacing="4" mb="4" position="relative">
                <Icon as={FiActivity} boxSize="6" color="green.500" />
                <Heading size="md" color={textColor}>Recent Activities</Heading>
              </HStack>
              <VStack align="stretch" spacing="4">
                {recentActivities.map((activity, index) => (
                  <Box
                    key={index}
                    p="4"
                    bg={hoverBg}
                    borderRadius="lg"
                    _hover={{ transform: "translateX(4px)" }}
                    transition="all 0.2s"
                  >
                    <Text fontWeight="medium">{activity.taskName}</Text>
                    <Text fontSize="sm" color={textColor}>
                      Updated on {new Date(activity.updatedAt).toLocaleDateString()}
                    </Text>
                  </Box>
                ))}
              </VStack>
            </Box>
          </GridItem>

          <GridItem>
            <Box
              p="6"
              bg={cardBg}
              borderRadius="xl"
              boxShadow="sm"
              border="1px"
              borderColor={borderColor}
              height="100%"
              position="relative"
              overflow="hidden"
            >
              <Box
                position="absolute"
                top="0"
                right="0"
                w="150px"
                h="150px"
                bgGradient="linear(to-br, purple.400, purple.600)"
                opacity="0.05"
                borderRadius="full"
                transform="translate(30%, -30%)"
              />
              <HStack spacing="4" mb="4" position="relative">
                <Icon as={FiClock} boxSize="6" color="purple.500" />
                <Heading size="md" color={textColor}>New Request Alerts</Heading>
              </HStack>
              <VStack align="stretch" spacing="4">
                {notifications.map((notification, index) => (
                  <Box
                    key={index}
                    p="4"
                    bg={hoverBg}
                    borderRadius="lg"
                    _hover={{ transform: "translateX(4px)" }}
                    transition="all 0.2s"
                  >
                    <Text fontWeight="medium">New request</Text>
                    <Text fontSize="sm" color={textColor}>
                      {notification.taskName}
                    </Text>
                  </Box>
                ))}
              </VStack>
            </Box>
          </GridItem>
        </Grid>
      </Box>
    </Box>
  );
};

const UserSidebar = () => {
  const navigate = useNavigate();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("blue.50", "blue.900");
  const activeBg = useColorModeValue("blue.100", "blue.800");
  const textColor = useColorModeValue("gray.700", "white");
  const activeTextColor = useColorModeValue("blue.600", "blue.200");

  return (
    <Box
      bg={bgColor}
      w="280px"
      minH="100vh"
      p="6"
      borderRight="1px"
      borderColor={borderColor}
      position="sticky"
      top="0"
    >
      <Flex align="center" mb="8">
        <Heading size="lg" fontSize="2xl" bgGradient="linear(to-r, blue.400, blue.600)" bgClip="text">
          TeamSync
        </Heading>
      </Flex>

      <VStack align="stretch" spacing="2">
        <Button
          variant="ghost"
          leftIcon={<FiHome />}
          onClick={() => navigate("/dashboard")}
          justifyContent="flex-start"
          _hover={{ bg: hoverBg, color: activeTextColor, transform: "translateX(4px)" }}
          _active={{ bg: activeBg }}
          size="lg"
          color={textColor}
          transition="all 0.2s"
        >
          Dashboard
        </Button>
        <Button
          variant="ghost"
          leftIcon={<FiSend />}
          onClick={() => navigate("/dashboard/requests")}
          justifyContent="flex-start"
          _hover={{ bg: hoverBg, color: activeTextColor, transform: "translateX(4px)" }}
          _active={{ bg: activeBg }}
          size="lg"
          color={textColor}
          transition="all 0.2s"
        >
          Requests
        </Button>
        <Button
          variant="ghost"
          leftIcon={<FiFileText />}
          onClick={() => navigate("/dashboard/tasks")}
          justifyContent="flex-start"
          _hover={{ bg: hoverBg, color: activeTextColor, transform: "translateX(4px)" }}
          _active={{ bg: activeBg }}
          size="lg"
          color={textColor}
          transition="all 0.2s"
        >
          Journal
        </Button>
        <Button
          variant="ghost"
          leftIcon={<FiUsers />}
          onClick={() => navigate("/dashboard/collaborations")}
          justifyContent="flex-start"
          _hover={{ bg: hoverBg, color: activeTextColor, transform: "translateX(4px)" }}
          _active={{ bg: activeBg }}
          size="lg"
          color={textColor}
          transition="all 0.2s"
        >
          Collaborations
        </Button>
        <Button
          variant="ghost"
          leftIcon={<FiTrello />}
          onClick={() => navigate("/dashboard/my-collaboration-hub")}
          justifyContent="flex-start"
          _hover={{ bg: hoverBg, color: activeTextColor, transform: "translateX(4px)" }}
          _active={{ bg: activeBg }}
          size="lg"
          color={textColor}
          transition="all 0.2s"
        >
          My Collaboration Hub
        </Button>
        <Button
          variant="ghost"
          leftIcon={<FiPenTool />}
          onClick={() => navigate("/dashboard/feedback")}
          justifyContent="flex-start"
          _hover={{ bg: hoverBg, color: activeTextColor, transform: "translateX(4px)" }}
          _active={{ bg: activeBg }}
          size="lg"
          color={textColor}
          transition="all 0.2s"
        >
          Feedback
        </Button>
      </VStack>

      <Divider my="6" />

      <Button
        variant="ghost"
        leftIcon={<FiLogOut />}
        onClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          navigate("/login");
        }}
        justifyContent="flex-start"
        _hover={{ bg: "red.50", color: "red.500", transform: "translateX(4px)" }}
        size="lg"
        transition="all 0.2s"
      >
        Logout
      </Button>
    </Box>
  );
};

const UserDashboardLayout = () => (
  <Flex>
    <UserSidebar />
    <Box flex="1" minH="100vh">
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="dashboard" element={<DashboardHome />} />
        <Route path="requests" element={<Requests />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="collaborations" element={<Collaborations />} />
        <Route path="my-collaboration-hub" element={<MyCollaborationHub />} />
        <Route path="feedback" element={<Feedback />} />
      </Routes>
    </Box>
  </Flex>
);

const Dashboard = () => {
  return <UserDashboardLayout />;
};

export default Dashboard;