export const DateUtils = {
    validateStartDate(startDateStr) {
        const today = new Date();

        const [day, month, year] = startDateStr.split("-");
        const startDate = new Date(`${year}-${month}-${day}T00:00:00`);

        if (isNaN(startDate.getTime())) {
            return {
                success: false,
                error: 'Invalid start date format',
                code: 'INVALID_DATE_FORMAT'
            };
        }

        if (startDate > today) {
            return {
                success: false,
                error: 'Start date cannot be in the future',
                code: 'FUTURE_DATE'
            };
        }

        return {
            success: true,
            data: startDate
        };
    },

    validateDateRange(startDateStr, endDateStr) {
        const today = new Date();

        const [startDay, startMonth, startYear] = startDateStr.split("-");
        const startDate = new Date(`${startYear}-${startMonth}-${startDay}T00:00:00`);

        if (isNaN(startDate.getTime())) {
            return {
                success: false,
                error: 'Invalid start date format',
                code: 'INVALID_START_DATE_FORMAT'
            };
        }

        const [endDay, endMonth, endYear] = endDateStr.split("-");
        const endDate = new Date(`${endYear}-${endMonth}-${endDay}T23:59:59`);

        if (isNaN(endDate.getTime())) {
            return {
                success: false,
                error: 'Invalid end date format',
                code: 'INVALID_END_DATE_FORMAT'
            };
        }

        if (endDate < today) {
            return {
                success: false,
                error: 'End date cannot be in the future',
                code: 'FUTURE_END_DATE'
            };
        }

        if (startDate > endDate) {
            return {
                success: false,
                error: 'Start date must be before or equal to end date',
                code: 'INVALID_DATE_RANGE'
            };
        }

        return true;
    }
};
