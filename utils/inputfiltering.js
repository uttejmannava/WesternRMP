export const convertProfessorName = (professorName) => {

    if (!professorName || typeof professorName !== 'string') {
        return '';
    }

    const parts = professorName.split('. ');
    
    if (parts.length !== 2) {
        return professorName;
    }

    const initial = parts[0];
    const lastName = parts[1];

    // return in format "Last F" (no period): found to be more accurate in searches
    return `${lastName} ${initial}`;
}

// encode a string to base64 with "School-" prefix
export function encodeToBase64(str) {
    
    if (!str || typeof str !== 'string') {
        return '';
    }

    str = 'School-'.concat(str);
    return btoa(str);
}

// decode a base64 string, optionally removing the "School-" or "Teacher-" prefix
export function decodeFromBase64(base64Str, removePrefix = false) {
  if (!base64Str || typeof base64Str !== 'string') {
    return '';
  }
  
  const decoded = atob(base64Str);
  
  if (removePrefix && (decoded.startsWith('School-') || decoded.startsWith('Teacher-'))) {
    return decoded.substring(7); // remove prefix
  }
  
  return decoded;
}