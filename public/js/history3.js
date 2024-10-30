document.addEventListener('DOMContentLoaded', function () {
    const temperatureInput = document.getElementById('temperature');
    const humidityInput = document.getElementById('humidity');
    const lightInput = document.getElementById('light');
    const windSpeedInput = document.getElementById('windSpeed');
    const dateTimeFilterInput = document.getElementById('dateTimeFilter');
    const limitSelect = document.getElementById('limitSelect');
    const sensorTableBody = document.getElementById('sensorTable')?.getElementsByTagName('tbody')[0];

    if (!temperatureInput || !humidityInput || !lightInput || !windSpeedInput || !dateTimeFilterInput || !limitSelect || !sensorTableBody) {
        console.error("One or more elements are missing in the DOM.");
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const initialPage = urlParams.get('page') || 1;
    loadData(initialPage, false);

    [temperatureInput, humidityInput, lightInput, windSpeedInput, dateTimeFilterInput, limitSelect].forEach(input => {
        input.addEventListener('input', () => loadData(1, true));
    });
});

const sortTable = (column, order) => {
    loadData(1, true, column, order);
};

const loadData = async (page = 1, shouldUpdateUrl = true, sortColumn = null, sortOrder = null) => {
    const temperatureInput = document.getElementById('temperature');
    const humidityInput = document.getElementById('humidity');
    const lightInput = document.getElementById('light');
    const windSpeedInput = document.getElementById('windSpeed');
    const dateTimeFilterInput = document.getElementById('dateTimeFilter');
    const limitSelect = document.getElementById('limitSelect');
    const sensorTableBody = document.getElementById('sensorTable')?.getElementsByTagName('tbody')[0];

    if (!sensorTableBody) {
        console.error("Element 'sensorTable' or 'tbody' is missing.");
        return;
    }

    const params = new URLSearchParams({
        temperature: temperatureInput.value,
        humidity: humidityInput.value,
        light: lightInput.value,
        windSpeed: windSpeedInput.value,
        dateTimeFilter: dateTimeFilterInput.value,
        page,
        limit: limitSelect.value,
        sortColumn,
        sortOrder
    }).toString();

    try {
        const response = await axios.get(`/api/weatherData?${params}`);
        const { records, currentPage, totalPages, limit } = response.data;

        if (shouldUpdateUrl) {
            const newUrl = `${window.location.pathname}?${params}`;
            history.pushState(null, '', newUrl);
        }

        sensorTableBody.innerHTML = '';

        records.forEach((record, index) => {
            const row = document.createElement('tr');
            const stt = (currentPage - 1) * limit + index + 1;
            row.innerHTML = `
                <td>${stt}</td>
                <td>${record.temperature}°C</td>
                <td>${record.humidity}%</td>
                <td>${record.light} lux</td>
                <td>${record.windSpeed} m/s</td>
                <td>${record.day} ${record.hour}</td>
            `;
            sensorTableBody.appendChild(row);
        });

        updatePagination(currentPage, totalPages, limit);

    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
};

const updatePagination = (currentPage, totalPages) => {
    const paginationWrapper = document.querySelector('.pagination');

    if (!paginationWrapper) {
        console.error('Không tìm thấy phần tử phân trang (.pagination)');
        return;
    }

    paginationWrapper.innerHTML = '';

    if (totalPages <= 1) return;
    if (currentPage > 1) {
        const firstLi = document.createElement('li');
        firstLi.classList.add('page-item');
        firstLi.innerHTML = `<a class="page-link" href="#">«</a>`;
        firstLi.addEventListener('click', (e) => {
            e.preventDefault(); 
            loadData(1); 
        });
        paginationWrapper.appendChild(firstLi);
    }

    if (currentPage > 1) {
        const prevLi = document.createElement('li');
        prevLi.classList.add('page-item');
        prevLi.innerHTML = `<a class="page-link" href="#">Trang Trước</a>`;
        prevLi.addEventListener('click', (e) => {
            e.preventDefault(); 
            loadData(currentPage - 1); 
        });
        paginationWrapper.appendChild(prevLi);
    }
    const paginationRange = getPaginationRange(currentPage, totalPages);
    paginationRange.forEach(page => {
        const li = document.createElement('li');
        li.classList.add('page-item');

        if (page === '...') {
            li.classList.add('disabled');
            li.innerHTML = `<span class="page-link">...</span>`;
        } else {
            if (page === currentPage) {
                li.classList.add('active');
                li.innerHTML = `<span class="page-link">${page}</span>`;
            } else {
                li.innerHTML = `<a class="page-link" href="#">${page}</a>`;
                li.addEventListener('click', (e) => {
                    e.preventDefault(); 
                    loadData(page); 
                });
            }
        }

        paginationWrapper.appendChild(li);
    });
    if (currentPage < totalPages) {
        const nextLi = document.createElement('li');
        nextLi.classList.add('page-item');
        nextLi.innerHTML = `<a class="page-link" href="#">Trang Sau</a>`;
        nextLi.addEventListener('click', (e) => {
            e.preventDefault(); 
            loadData(currentPage + 1);
        });
        paginationWrapper.appendChild(nextLi);
    }

    if (currentPage < totalPages) {
        const lastLi = document.createElement('li');
        lastLi.classList.add('page-item');
        lastLi.innerHTML = `<a class="page-link" href="#">»</a>`;
        lastLi.addEventListener('click', (e) => {
            e.preventDefault(); 
            loadData(totalPages);
        });
        paginationWrapper.appendChild(lastLi);
    }
};
const getPaginationRange = (currentPage, totalPages, delta = 2) => {
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
            range.push(i);
        }
    }
    range.forEach(i => {
        if (l) {
            if (i - l === 2) {
                rangeWithDots.push(l + 1);
            } else if (i - l !== 1) {
                rangeWithDots.push('...');
            }
        }
        rangeWithDots.push(i);
        l = i;
    });

    return rangeWithDots;
};
