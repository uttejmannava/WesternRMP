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
  const nameParts = professorName.trim().split(/\s+/);
  if (nameParts.length < 2) return null;

  const firstNameInitial = nameParts[nameParts.length - 1].charAt(0).toLowerCase();
  const lastNameParts = nameParts.slice(0, -1).map(part => part.toLowerCase());
  const fullLastName = lastNameParts.join(' ').toLowerCase();

  let nameMatches = edges.filter(edge => {
      const professor = edge.node;

      const profFirstInitial = professor.firstName?.charAt(0).toLowerCase();
      const profLastName = professor.lastName?.toLowerCase();

      if (profFirstInitial !== firstNameInitial) return false;

      if (fullLastName === profLastName) return true;

      if (lastNameParts.includes(profLastName)) return true;

      return false;
  });

  if (nameMatches.length === 1) {
      return nameMatches[0];
  }

  if (nameMatches.length > 1) {
      const deptMatches = nameMatches.filter(edge =>
          edge.node.department && departmentIsCloseMatch(edge.node.department, targetDepartment)
      );
      if (deptMatches.length > 0) {
          return deptMatches[0];
      }
  }

  return nameMatches.length > 0 ? nameMatches[0] : null;
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