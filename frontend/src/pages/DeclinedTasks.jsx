import React, { useState, useEffect } from "react";
import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td,
  Input, Flex, useToast, Button, useColorModeValue,
  Image, InputGroup, InputLeftElement, Icon
} from "@chakra-ui/react";
import { FiSearch } from 'react-icons/fi';
import axios from "axios";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import teamsImage from "../assets/teams.png";

const DeclinedTasks = () => {
  const [entries, setEntries]     = useState([]);
  const [users, setUsers]         = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const toast = useToast();
  const companyID = localStorage.getItem("companyID");

  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.700", "white");
  const headingColor = useColorModeValue("blue.600", "blue.300");
  const tableHeaderBg = useColorModeValue("gray.50", "gray.600");
  const tableRowHover = useColorModeValue("gray.50", "gray.600");
  const inputBg = useColorModeValue("gray.50", "gray.600");

  useEffect(() => {
    // 1) Fetch TS→full‑name map
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/users");
        const map = res.data.reduce((acc, u) => {
          acc[u.companyID] = u.fullName;
          return acc;
        }, {});
        setUsers(map);
      } catch (err) {
        console.error("Error loading users", err);
        toast({ title: "Error", description: "Cannot load users", status: "error" });
      }
    };

    // 2) Fetch all declined entries
    const fetchAllDeclined = async () => {
      try {
        // If the user is a manager, fetch all declined entries
          const res = await axios.get("http://localhost:5000/api/requests/declined"
        );
        setEntries(res.data);
      } catch (err) {
        console.error("Error loading declined entries", err);
        toast({ title: "Error", description: "Cannot load declined tasks", status: "error" });
      }
    };

    fetchUsers();
    fetchAllDeclined();
  }, [companyID, toast]);

  const getName = (code) => users[code] || code;

  // filter by both assignee's name and task name
  const filtered = entries.filter(e =>
    getName(e.assignee).toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const title = "Declined Requests Report";
  
    // Add the TeamSync logo at the beginning of the PDF
    const logoUrl = '/TeamSynclogo.png'; // Absolute path to the logo in the public folder
    const imgWidth = 50; // Width of the logo
    const imgHeight = 50; // Height of the logo
    const pageWidth = doc.internal.pageSize.width; // Get the page width
  
    // Fetch the image as a Base64 string
    fetch(logoUrl)
      .then(response => response.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onload = function () {
          const base64Image = reader.result.split(',')[1]; // Extract the Base64 string
          doc.addImage(
            base64Image,
            'PNG',
            (pageWidth - imgWidth) / 2, // Center horizontally
            10, // Position 10 units from the top
            imgWidth,
            imgHeight
          );
  
          // Add the title below the logo
          doc.text(title, 20, imgHeight + 20);
  
          // Add the table
          autoTable(doc, {
            startY: imgHeight + 30, // Start the table below the logo and title
            head: [['Task Name', 'Requested By', 'Declined By', 'Declined On', 'Reason', 'Alternative Date']],
            body: filtered.map(entry => [
              entry.title,
              getName(entry.assignedBy),
              getName(entry.assignee),
              new Date(entry.declinedOn).toLocaleDateString(),
              entry.declinedReason,
              new Date(entry.alternativeDate).toLocaleDateString()
            ]),
          });
  
          // Save the PDF
          doc.save(`${title}.pdf`);
        };
        reader.readAsDataURL(blob); // Convert the blob to a Base64 string
      })
      .catch(error => {
        console.error('Failed to load the logo image:', error);
  
        // Add the title and table even if the logo fails to load
        doc.text(title, 20, 20);
        autoTable(doc, {
          startY: 30,
          head: [['Task Name', 'Requested By', 'Declined By', 'Declined On', 'Reason', 'Alternative Date']],
          body: filtered.map(entry => [
            entry.title,
            getName(entry.assignedBy),
            getName(entry.assignee),
            new Date(entry.declinedOn).toLocaleDateString(),
            entry.declinedReason,
            new Date(entry.alternativeDate).toLocaleDateString()
          ]),
        });
  
        // Save the PDF
        doc.save(`${title}.pdf`);
      });
  };

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
          alt="Declined Tasks Background"
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
      <Box p="8" position="relative" zIndex="1">
        <Heading mb="6" color={headingColor}>Declined Requests</Heading>
        <Flex mb="4" justify="space-between">
          <InputGroup width="40%">
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
          <Button 
            colorScheme="blue" 
            onClick={handleExportPDF}
            _hover={{ transform: "translateY(-1px)", boxShadow: "md" }}
            transition="all 0.2s"
          >
            Export PDF
          </Button>
        </Flex>
        <Box 
          bg={cardBg} 
          p="4" 
          borderRadius="xl" 
          boxShadow="lg"
          border="1px"
          borderColor={borderColor}
        >
          <Table variant="simple">
            <Thead bg={tableHeaderBg}>
              <Tr>
                <Th color={textColor}>Task Name</Th>
                <Th color={textColor}>Requested By</Th>
                <Th color={textColor}>Declined By</Th>
                <Th color={textColor}>Declined On</Th>
                <Th color={textColor}>Reason</Th>
                <Th color={textColor}>Alt. Date</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map((d) => (
                <Tr 
                  key={d._id}
                  _hover={{ bg: tableRowHover }}
                  transition="all 0.2s"
                >
                  <Td color={textColor}>{d.title}</Td>
                  <Td color={textColor}>{getName(d.assignedBy)}</Td>
                  <Td color={textColor}>{getName(d.assignee)}</Td>
                  <Td color={textColor}>{new Date(d.declinedOn).toLocaleDateString()}</Td>
                  <Td color={textColor}>{d.declinedReason}</Td>
                  <Td color={textColor}>{new Date(d.alternativeDate).toLocaleDateString()}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Box>
    </Box>
  );
};

export default DeclinedTasks;
