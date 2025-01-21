export const getHemoglobinCategory = (hemoglobin, gender) => {
    if (gender === 'Male') {
        if (hemoglobin < 13.5) return { label: 'Low', color: '#FFC107' };
        if (hemoglobin <= 17.5) return { label: 'Normal', color: '#4CAF50' };
        return { label: 'High', color: '#F44336' };
    } else {
        if (hemoglobin < 12.0) return { label: 'Low', color: '#FFC107' };
        if (hemoglobin <= 15.5) return { label: 'Normal', color: '#4CAF50' };
        return { label: 'High', color: '#F44336' };
    }
};

export const getRBCCategory = (rbc, gender) => {
    if (gender === 'Male') {
        if (rbc < 4.5) return { label: 'Low', color: '#FFC107' };
        if (rbc <= 5.9) return { label: 'Normal', color: '#4CAF50' };
        return { label: 'High', color: '#F44336' };
    } else {
        if (rbc < 4.0) return { label: 'Low', color: '#FFC107' };
        if (rbc <= 5.2) return { label: 'Normal', color: '#4CAF50' };
        return { label: 'High', color: '#F44336' };
    }
};

export const getWBCCategory = (wbc) => {
    if (wbc < 4000) return { label: 'Low', color: '#FFC107' };
    if (wbc <= 11000) return { label: 'Normal', color: '#4CAF50' };
    return { label: 'High', color: '#F44336' };
};

export const getPlateletCategory = (platelet) => {
    if (platelet < 150000) return { label: 'Low', color: '#FFC107' };
    if (platelet <= 450000) return { label: 'Normal', color: '#4CAF50' };
    return { label: 'High', color: '#F44336' };
}; 