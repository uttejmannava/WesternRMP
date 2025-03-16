import { GRAPHQL_URL, UWO_SCHOOL_ID, AUTH_TOKEN } from "./constants.js";
import { convertProfessorName } from './utils/inputfiltering.js';
import { filterProfessorResults } from './utils/outputfiltering.js';

const isGraphQLReachable = async () => {
    try {
      const response = await fetch(GRAPHQL_URL, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
};


const searchProfessor = async (professorName, schoolId = UWO_SCHOOL_ID, professorDepartment) => {
    const query = `query NewSearchTeachersQuery(
    $query: TeacherSearchQuery!) {
        newSearch {
            teachers(query: $query) {
                didFallback
                edges {
                    cursor
                    node {
                        id
                        legacyId
                        firstName
                        lastName
                        avgRatingRounded
                        numRatings
                        wouldTakeAgainPercentRounded
                        wouldTakeAgainCount
                        teacherRatingTags {
                            id
                            legacyId
                            tagCount
                            tagName
                        }
                        mostUsefulRating {
                            id
                            class
                            isForOnlineClass
                            legacyId
                            comment
                            helpfulRatingRounded
                            ratingTags
                            grade
                            date
                            iWouldTakeAgain
                            qualityRating
                            difficultyRatingRounded
                            teacherNote{
                                id
                                comment
                                createdAt
                                class
                            }
                            thumbsDownTotal
                            thumbsUpTotal
                        }
                        avgDifficultyRounded
                        school {
                            name
                            id
                        }
                        department
                    }
                }
            }
        }
    }`;
    
    try {
        console.log(`Searching for professor: ${professorName} in ${professorDepartment}`);
        
        const response = await fetch(GRAPHQL_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': AUTH_TOKEN,
                'Accept': 'application/json',
                'Origin': 'https://www.ratemyprofessors.com'
            },
            body: JSON.stringify({
                query: query,
                variables: {
                    query: {
                        text: convertProfessorName(professorName),
                        schoolID: schoolId
                    }
                }
            })
        });
        
        if (!response.ok) {
            console.error(`API request failed with status: ${response.status}`);
            return null;
        }
        
        const data = await response.json();
        console.log("API response:", data);
        
        if (!data || !data.data) {
            console.error('API response missing data property:', data);
            return null;
        }
        
        if (!data.data.newSearch || !data.data.newSearch.teachers) {
            console.error('API response missing newSearch.teachers:', data.data);
            return null;
        }
        
        const edges = data.data.newSearch.teachers.edges;
        
        if (edges.length === 0) {
            console.log(`No results found for professor: ${professorName}`);
            return null;
        }
        
        const professor = filterProfessorResults(edges, convertProfessorName(professorName), professorDepartment);
        console.log(`Found professor data:`, professor);
        return professor;
    } catch (error) {
        console.error('Error searching for professor:', error);
        return null;
    }
};


chrome.runtime.onMessage.addListener((message, sendResponse) => {
    console.log("Background received message:", message);
    
    if (message.action === "searchProfessor") {
        const { professorName, schoolId = UWO_SCHOOL_ID, department } = message;
        console.log(`Processing search request for: ${professorName}, department: ${department}`); // debug
        
        if (!professorName) {
            console.error("Missing professor name in request");
            sendResponse({ success: false, error: "Professor name is required" });
            return true;
        }
        
        searchProfessor(professorName, schoolId, department)
            .then(professorData => {
                if (professorData) {
                    console.log(`Sending successful response for ${professorName}`);
                    sendResponse({ success: true, professor: professorData });
                } else {
                    console.log(`Professor not found: ${professorName}`);
                    sendResponse({ 
                        success: false, 
                        error: "Professor not found",
                        searchTerm: professorName,
                        convertedName: convertProfessorName(professorName)
                    });
                }
            })
            .catch(error => {
                console.error(`Error in searchProfessor for ${professorName}:`, error);
                sendResponse({ 
                    success: false, 
                    error: "Error searching for professor: " + error.message 
                });
            });
        
        return true; // Return true to indicate we'll send a response asynchronously
    }
    
    return false;
});

// Test the API on background script load
(async () => {
    console.log("Testing API connection...");
    try {
        const testResult = await searchProfessor("K. Linton", UWO_SCHOOL_ID, "Anthropology");
        console.log("Test API result:", testResult);
    } catch (error) {
        console.error("Test API error:", error);
    }
})();

console.log("Background script loaded, listening.");