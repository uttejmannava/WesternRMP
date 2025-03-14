import { GRAPHQL_URL, UWO_SCHOOL_ID, AUTH_TOKEN } from "./constants.js";


const isGraphQLReachable = async () => {
    try {
      const response = await fetch(GRAPHQL_URL, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  };


const searchProfessor = async (namePattern, schoolId) => {
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
                    text: namePattern,
                    schoolId: schoolId
                    
                }
            }
        })
    }).then(response => response.json()).catch(error => {
        console.error('Error searching for professor:', error);
        return null;
    });

    return response.data.newSearch.teachers.edges;
}
