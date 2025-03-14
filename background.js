import { GRAPHQL_URL, UWO_SCHOOL_ID, AUTH_TOKEN } from "./constants.js";
import { convertProfessorName } from './utils/inputfiltering.js';

const isGraphQLReachable = async () => {
    try {
      const response = await fetch(GRAPHQL_URL, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  };


const searchProfessor = async (professorName, schoolId, professorDepartment) => {
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
    
    const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `${AUTH_TOKEN}`,
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            query: query,
            variables: {
                query: {
                    text: convertProfessorName(professorName),
                    schoolId: schoolId
                }
            }
        })
    }).then(response => response.json()).catch(error => {
        console.error('Error searching for professor:', error);
        return null;
    });

    const edges = response.data.newSearch.teachers.edges;
    
    // if no results, return null
    if (edges.length === 0) {
        return null;
    }

    const professor = response.data.newSearch.teachers.edges[0].node;
    
    

    return professor;
}
