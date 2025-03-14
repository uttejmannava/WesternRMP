export const filterProfessorResults = (edges, professorName, professorDepartment) => {
    const nameParts = professorName.split(/\s+/);
    const targetLastName = nameParts[0].toLowerCase();
    const targetFirstNameInitial = nameParts[1].charAt(0).toLowerCase();
    
    const filteredEdges = edges.filter(edge => {
        const professor = edge.node;
        
        const professorLastName = professor.lastName.toLowerCase();
        if (professorLastName !== targetLastName) return false;
        
        const professorFirstNameInitial = professor.firstName.charAt(0).toLowerCase();
        if (targetFirstNameInitial && professorFirstNameInitial !== targetFirstNameInitial) return false;
        
        if (professor.department !== professorDepartment) return false;
        
        return true;
    });
    
    return filteredEdges.length > 0 ? filteredEdges[0] : null;
};