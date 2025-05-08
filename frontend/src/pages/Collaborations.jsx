import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Flex,
  Progress,
  Text,
  useColorModeValue,
  Icon,
  InputGroup,
  InputLeftElement,
  Image,
} from "@chakra-ui/react";
import { FiSearch, FiUser, FiCalendar, FiClock, FiBarChart2 } from "react-icons/fi";
import teamsImage from "../assets/teams.png";

const Collaborations = () => {
  const [collaborations, setCollaborations] = useState([]);
  const [users, setUsers] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.700", "white");
  const headingColor = useColorModeValue("blue.600", "blue.300");
  const inputBg = useColorModeValue("gray.50", "gray.600");
  const tableBg = useColorModeValue("white", "gray.700");
  const tableHeaderBg = useColorModeValue("gray.50", "gray.600");
  const tableBorderColor = useColorModeValue("gray.200", "gray.600");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all users
        const usersRes = await axios.get("http://localhost:5000/api/admin/users");
        const usersMap = usersRes.data.reduce((acc, user) => {
          acc[user.companyID] = user.fullName;
          return acc;
        }, {});
        setUsers(usersMap);

        // Fetch ongoing collaborations
        const collabRes = await axios.get("http://localhost:5000/api/requests/ongoing");
        setCollaborations(collabRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  const getUserName = (companyID) => {
    return users[companyID] || companyID;
  };

  const filteredCollaborations = collaborations.filter((collab) =>
    getUserName(collab.assignedBy).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getUserName(collab.assignee).toLowerCase().includes(searchTerm.toLowerCase()) ||
    collab.taskName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box 
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
          alt="Collaborations Background"
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
      <Box p={5} position="relative" zIndex="1">
        <Heading
          mb={6}
          color={headingColor}
          fontWeight="bold"
          letterSpacing="tight"
        >
          Ongoing Collaborations
        </Heading>

        <Box 
          bg={cardBg} 
          p={6} 
          borderRadius="xl" 
          boxShadow="md" 
          border="1px" 
          borderColor={borderColor}
        >
          <Flex mb={6} justify="space-between">
            <InputGroup maxW="60%">
              <InputLeftElement pointerEvents="none">
                <Icon as={FiSearch} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search by Employee Name or Task Name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg={inputBg}
                _hover={{ borderColor: "blue.400" }}
                _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
              />
            </InputGroup>
          </Flex>

          <Box overflowX="auto">
            <Table variant="simple" bg={tableBg}>
              <Thead bg={tableHeaderBg}>
                <Tr>
                  <Th borderColor={tableBorderColor}>Task Name</Th>
                  <Th borderColor={tableBorderColor}>
                    <Flex align="center">
                      <Icon as={FiUser} mr={2} />
                      Requested By
                    </Flex>
                  </Th>
                  <Th borderColor={tableBorderColor}>
                    <Flex align="center">
                      <Icon as={FiUser} mr={2} />
                      Accepted By
                    </Flex>
                  </Th>
                  <Th borderColor={tableBorderColor}>
                    <Flex align="center">
                      <Icon as={FiCalendar} mr={2} />
                      Expected On
                    </Flex>
                  </Th>
                  <Th borderColor={tableBorderColor}>
                    <Flex align="center">
                      <Icon as={FiClock} mr={2} />
                      Initiated On
                    </Flex>
                  </Th>
                  <Th borderColor={tableBorderColor}>
                    <Flex align="center">
                      <Icon as={FiBarChart2} mr={2} />
                      Progress
                    </Flex>
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredCollaborations.map((collaboration) => (
                  <Tr 
                    key={collaboration._id}
                    _hover={{ bg: useColorModeValue("gray.50", "gray.600") }}
                    transition="all 0.2s"
                  >
                    <Td borderColor={tableBorderColor} color={textColor}>
                      {collaboration.taskName}
                    </Td>
                    <Td borderColor={tableBorderColor} color={textColor}>
                      {getUserName(collaboration.assignedBy)}
                    </Td>
                    <Td borderColor={tableBorderColor} color={textColor}>
                      {getUserName(collaboration.assignee)}
                    </Td>
                    <Td borderColor={tableBorderColor} color={textColor}>
                      {new Date(collaboration.deadline).toLocaleDateString()}
                    </Td>
                    <Td borderColor={tableBorderColor} color={textColor}>
                      {new Date(collaboration.createdAt).toLocaleDateString()}
                    </Td>
                    <Td borderColor={tableBorderColor}>
                      <Flex align="center">
                        <Progress
                          value={typeof collaboration.progress === 'number' ? collaboration.progress : 0}
                          size="sm"
                          colorScheme="blue"
                          borderRadius="full"
                          flex="1"
                          mr={2}
                        />
                        <Text color={textColor} fontSize="sm">
                          {typeof collaboration.progress === 'number' ? `${collaboration.progress}%` : '0%'}
                        </Text>
                      </Flex>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Collaborations;