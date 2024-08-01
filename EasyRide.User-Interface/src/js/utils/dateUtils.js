class DateUtils {
    static getHourMinStringFromDateISO(dateStr) {
        const date = new Date(dateStr);

        const hour = date.getHours();
        const min = date.getMinutes();

        return `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
    }

    static getDaysDifferenceForDateISO(startDateStr, endDateStr) {
        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);
        const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        return Math.abs(end-start)/(1000*60*60*24);
    }

    static getDifferanceForDateISO(startDateStr, endDateStr) {
        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);
        return Math.abs(endDate-startDate);
    }

    static getDifferenceStringForDateISO(startDateStr, endDateStr) {
        const diffInMilliseconds = this.getDifferanceForDateISO(startDateStr, endDateStr);

        const days = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffInMilliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffInMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
        const result = [];
        if (days !== 0) result.push(`${days}d`);
        if (hours !== 0 || result.length != 0) result.push(`${hours.toString().padStart(2, '0')}h`);
        if (minutes !== 0 || result.length != 0) result.push(`${minutes.toString().padStart(2, '0')}m`);
    
        return result.join(' ');
    }
}

export { DateUtils };