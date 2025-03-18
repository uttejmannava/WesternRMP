// maps faculties to subjects/departments they typically contain
const FACULTY_SUBJECT_MAP = {
  'science': ['biology', 'chemistry', 'physics', 'computer science', 'mathematics', 'statistics', 'earth sciences'],
  'engineering': ['mechanical', 'electrical', 'civil', 'chemical', 'software', 'computer'],
  'arts': ['english', 'history', 'philosophy', 'languages', 'linguistics', 'literature'],
  'social science': ['psychology', 'sociology', 'anthropology', 'economics', 'political science'],
  'business': ['marketing', 'finance', 'accounting', 'management', 'economics'],
  'health': ['nursing', 'medicine', 'kinesiology', 'health sciences'],
  'mathematics': ['statistics', 'applied mathematics', 'math', 'actuarial'],
  'computer science': ['software engineering', 'information technology', 'data science']
};


export const filterProfessorResults = (edges, professorName, targetDepartment) => {
    const nameParts = professorName.split(/\s+/);
    const targetLastName = nameParts[0].toLowerCase();
    const targetFirstNameInitial = nameParts[1].charAt(0).toLowerCase();
    
    const filteredEdges = edges.filter(edge => {
        const professor = edge.node;
        
        const professorLastName = professor.lastName.toLowerCase();
        if (professorLastName !== targetLastName) return false;
        
        const professorFirstNameInitial = professor.firstName.charAt(0).toLowerCase();
        if (targetFirstNameInitial && professorFirstNameInitial !== targetFirstNameInitial) return false;
        
        if (professor.department && !departmentIsCloseMatch(professor.department, targetDepartment)) {
            return false;
        }
        
        return true;
    });
    
    return filteredEdges.length > 0 ? filteredEdges[0] : null;
};

export const departmentIsCloseMatch = (professorDepartment, targetDepartment) => {
  if (!professorDepartment || !targetDepartment) return false;
  
  const profDeptLower = professorDepartment.toLowerCase().trim();
  const targetDeptLower = targetDepartment.toLowerCase().trim();
  
  // direct match
  if (profDeptLower === targetDeptLower) return true;
  
  // substring match; inclusion in either direction
  if (profDeptLower.includes(targetDeptLower) || targetDeptLower.includes(profDeptLower)) return true;
  
  // faculty-subject relationships
  for (const [faculty, subjects] of Object.entries(FACULTY_SUBJECT_MAP)) {
    // professor is in a faculty and target is a subject in that faculty
    if (profDeptLower.includes(faculty) && subjects.some(subject => targetDeptLower.includes(subject))) {
      return true;
    }
    
    // target is a faculty and professor is in a subject in that faculty
    if (targetDeptLower.includes(faculty) && subjects.some(subject => profDeptLower.includes(subject))) {
      return true;
    }
  }
  
  return false;
};