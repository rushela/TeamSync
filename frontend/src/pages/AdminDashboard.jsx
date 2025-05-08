import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Flex, 
  Heading, 
  Text, 
  VStack, 
  Button, 
  Grid, 
  GridItem,
  useColorModeValue,
  Icon,
  Image,
  Badge,
  Avatar,
  HStack
} from '@chakra-ui/react';
import { FiHome, FiUsers, FiFileText, FiBell, FiTerminal, FiLogOut, FiActivity, FiSend, FiSettings,FiXOctagon } from 'react-icons/fi';
import axios from 'axios';
import UserManagement from './UserManagement';
import Evaluation from './Evaluation';
import DeclinedTasks from './DeclinedTasks';
import NotificationBell from '../components/NotificationBell';
import teamsImage from "../assets/teams.png";

const DashboardHome = () => {
  const [fullName, setFullName] = useState('');
  const [companyID, setCompanyID] = useState('');
  const [statistics, setStatistics] = useState({});
  const [recentActivities, setRecentActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const cardBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    axios.get('http://localhost:5000/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => {
      setFullName(res.data.fullName);
      setCompanyID(res.data.companyID);
    })
    .catch((err) => {
      console.error('Error fetching user profile', err);
    });

    fetchStatistics();
    fetchRecentActivities();
    fetchNotifications();
  }, []);

  const fetchStatistics = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/employeeStat/users');
      const employees = res.data;

      let totalAcceptanceRate = 0;
      let totalCompletionRate = 0;
      let totalOntimeRate = 0;
      let totalEvaluations = 0;

      employees.forEach(employee => {
        const requests = employee.requests.filter(request => {
          const requestDate = new Date(request.createdAt);
          const startDate = new Date(new Date().setDate(1));
          const endDate = new Date();
          return requestDate >= startDate && requestDate <= endDate;
        });

        const accepted = requests.filter(request => request.status === 'ongoing').length;
        const declined = requests.filter(request => request.status === 'declined').length;
        const completed = requests.filter(request => request.status === 'completed').length;
        const acceptanceRate = (accepted / (accepted + declined)) * 100 || 0;
        const completedRate = (completed / requests.length) * 100 || 0;
        const ontimeRate = (requests.filter(request => request.status === 'completed' && new Date(request.deadline) >= new Date(request.completedOn)).length / completed) * 100 || 0;

        totalAcceptanceRate += acceptanceRate;
        totalCompletionRate += completedRate;
        totalOntimeRate += ontimeRate;
        totalEvaluations++;
      });

      setStatistics({
        averageAcceptanceRate: (totalAcceptanceRate / totalEvaluations).toFixed(0),
        averageCompletionRate: (totalCompletionRate / totalEvaluations).toFixed(0),
        averageOntimeRate: (totalOntimeRate / totalEvaluations).toFixed(0),
      });
    } catch (err) {
      console.error('Error fetching statistics', err);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/evaluations/all');
      const sortedActivities = res.data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 10);
      setRecentActivities(sortedActivities);
    } catch (err) {
      console.error('Error fetching recent activities', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
      const usersRes = await axios.get('http://localhost:5000/api/employeeStat/users');
      const evaluationsRes = await axios.get('http://localhost:5000/api/evaluations/all');
      const users = usersRes.data;
      const evaluations = evaluationsRes.data;

      const employeesNotEvaluated = users.filter(user => {
        const userEvaluations = evaluations.filter(evaluation => evaluation.employee === user.fullName && evaluation.month === currentMonth);
        return userEvaluations.length === 0;
      }).map(user => user.fullName);

      setNotifications(employeesNotEvaluated);
    } catch (err) {
      console.error('Error fetching notifications', err);
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
          src={teamsImage}
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
              <Heading size="lg" color={textColor}>
                Welcome, {fullName}
                {companyID && (
                  <Badge ml="2" colorScheme="blue" fontSize="sm">
                    {companyID}
                  </Badge>
                )}
              </Heading>
              <Text color={textColor} mt="1">
                Admin Dashboard Overview
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
                <Icon as={FiActivity} boxSize="6" color="blue.500" />
                <Heading size="md" color={textColor}>Average Acceptance Rate</Heading>
              </HStack>
              <Text fontSize="3xl" fontWeight="bold" color="blue.500" position="relative">
                {statistics.averageAcceptanceRate}%
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
                <Icon as={FiTerminal} boxSize="6" color="green.500" />
                <Heading size="md" color={textColor}>Average Completion Rate</Heading>
              </HStack>
              <Text fontSize="3xl" fontWeight="bold" color="green.500" position="relative">
                {statistics.averageCompletionRate}%
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
                <Heading size="md" color={textColor}>Average Ontime Rate</Heading>
              </HStack>
              <Text fontSize="3xl" fontWeight="bold" color="purple.500" position="relative">
                {statistics.averageOntimeRate}%
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
                <Icon as={FiActivity} boxSize="6" color="blue.500" />
                <Heading size="md" color={textColor}>Recent Activities</Heading>
              </HStack>
              <VStack align="stretch" spacing="4">
                {recentActivities.map((activity, index) => (
                  <Box
                    key={index}
                    p="4"
                    bg={useColorModeValue("gray.50", "gray.600")}
                    borderRadius="lg"
                    _hover={{ transform: "translateX(4px)" }}
                    transition="all 0.2s"
                  >
                    <Text fontWeight="medium">{activity.employee}</Text>
                    <Text fontSize="sm" color={textColor}>
                      Evaluated on {new Date(activity.updatedAt).toLocaleDateString()}
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
                <Icon as={FiBell} boxSize="6" color="purple.500" />
                <Heading size="md" color={textColor}>Evaluation Reminders</Heading>
              </HStack>
              <VStack align="stretch" spacing="4">
                {notifications.map((notification, index) => (
                  <Box
                    key={index}
                    p="4"
                    bg={useColorModeValue("gray.50", "gray.600")}
                    borderRadius="lg"
                    _hover={{ transform: "translateX(4px)" }}
                    transition="all 0.2s"
                  >
                    <Text fontWeight="medium">{notification}</Text>
                    <Text fontSize="sm" color={textColor}>
                      Has not been evaluated this month
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

const AdminSidebar = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const companyID = localStorage.getItem("companyID");
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
          TeamSync Admin
        </Heading>
       
      </Flex>

      <VStack align="stretch" spacing="2">
        <Button
          variant="ghost"
          leftIcon={<FiHome />}
          onClick={() => navigate("/admindashboard")}
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
          leftIcon={<FiActivity />}
          onClick={() => navigate("/admindashboard/evaluation")}
          justifyContent="flex-start"
          _hover={{ bg: hoverBg, color: activeTextColor, transform: "translateX(4px)" }}
          _active={{ bg: activeBg }}
          size="lg"
          color={textColor}
          transition="all 0.2s"
        >
          Evaluation
        </Button>
        <Button
          variant="ghost"
          leftIcon={<FiXOctagon />}
          onClick={() => navigate("/admindashboard/declinedtask")}
          justifyContent="flex-start"
          _hover={{ bg: hoverBg, color: activeTextColor, transform: "translateX(4px)" }}
          _active={{ bg: activeBg }}
          size="lg"
          color={textColor}
          transition="all 0.2s"
        >
          Declined Requests
        </Button>
        {(role === "Admin" || role === "BusinessOwner" || role === "Manager") && (
          <Button
            variant="ghost"
            leftIcon={<FiUsers />}
            onClick={() => navigate("/admindashboard/user-management")}
            justifyContent="flex-start"
            _hover={{ bg: hoverBg, color: activeTextColor, transform: "translateX(4px)" }}
            _active={{ bg: activeBg }}
            size="lg"
            color={textColor}
            transition="all 0.2s"
          >
            User Management
          </Button>
        )}
      </VStack>

      <Box mt="auto" pt="6">
        <Button
          variant="ghost"
          leftIcon={<FiLogOut />}
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
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
    </Box>
  );
};

// Layout combining the sidebar and nested routes
const AdminDashboardLayout = () => (
  <Flex>
    <AdminSidebar />
    <Box flex="1" bg="gray.100" minH="100vh">
      <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="dashboard" element={<DashboardHome />} />
        <Route path="declinedtask" element={<DeclinedTasks />} />
        <Route path="user-management" element={<UserManagement />} />
        <Route path="evaluation" element={<Evaluation />} />
        <Route
          path="settings"
          element={<Box p="8"><Heading>Settings Page</Heading></Box>}
        />
      </Routes>
    </Box>
  </Flex>
);

const AdminDashboard = () => {
  return <AdminDashboardLayout />;
};

export default AdminDashboard;