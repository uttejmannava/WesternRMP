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
