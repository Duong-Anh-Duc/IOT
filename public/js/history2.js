document.addEventListener('DOMContentLoaded', function () {
    const filterForm = document.getElementById('filterForm');
    const weatherTableBody = document.getElementById('weatherTable').getElementsByTagName('tbody')[0];
    const sortFieldSelect = document.getElementById('sortField');
    const sortOrderSelect = document.getElementById('sortOrder');
    const sortOrderLabel = document.querySelector('label[for="sortOrder"]');

    sortOrderSelect.style.display = 'none';
    sortOrderLabel.style.display = 'none';

    sortFieldSelect.addEventListener('change', function () {
        if (sortFieldSelect.value !== 'none') {
            sortOrderSelect.style.display = 'block';
            sortOrderLabel.style.display = 'block';
        } else {
            sortOrderSelect.style.display = 'none';
            sortOrderLabel.style.display = 'none';
        }
    });

    const urlParams = new URLSearchParams(window.location.search);
    const initialPage = urlParams.get('page') || 1;

    loadData(initialPage, false);

    filterForm.addEventListener('submit', function (e) {
        e.preventDefault();
        loadData(1, true);
    });
});

const loadData = async (page = 1, shouldUpdateUrl = true) => {
    const filterForm = document.getElementById('filterForm');
    const weatherTableBody = document.getElementById('weatherTable').getElementsByTagName('tbody')[0];

    const formData = new FormData(filterForm);
    formData.append('page', page);
    const params = new URLSearchParams(formData).toString();

    try {
        const response = await axios.get(`/weatherData?${params}`);
        const { records, currentPage, totalPages, limit } = response.data;

        if (shouldUpdateUrl) {
            const newUrl = `${window.location.pathname}?${params}`;
            history.pushState(null, '', newUrl);
        }

        weatherTableBody.innerHTML = '';

        records.forEach((record, index) => {
            const row = document.createElement('tr');
            const stt = (currentPage - 1) * limit + index + 1;
            row.innerHTML = `
                <td>${stt}</td>
                <td>${record.temperature}°C</td>
                <td>${record.humidity}%</td>
                <td>${record.light} lux</td>
                <td>${record.Day} ${record.Hour}</td>
            `;
            weatherTableBody.appendChild(row);
        });

        updatePagination(currentPage, totalPages, limit);

    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
};

const updatePagination = (currentPage, totalPages, limit) => {
    const paginationWrapper = document.querySelector('.pagination');
    
    if (!paginationWrapper) {
        console.error('Không tìm thấy phần tử phân trang (.pagination)');
        return;
    }

    paginationWrapper.innerHTML = '';

    if (totalPages <= 1) return;

    if (currentPage > 1) {
        paginationWrapper.innerHTML += `<li class="page-item"><a class="page-link" href="#" onclick="loadData(1, true)">«</a></li>`;
        paginationWrapper.innerHTML += `<li class="page-item"><a class="page-link" href="#" onclick="loadData(${currentPage - 1}, true)">Trang Trước</a></li>`;
    }

    const paginationRange = getPaginationRange(currentPage, totalPages);
    paginationRange.forEach(page => {
        if (page === '...') {
            paginationWrapper.innerHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        } else if (page === currentPage) {
            paginationWrapper.innerHTML += `<li class="page-item active"><span class="page-link">${page}</span></li>`;
        } else {
            paginationWrapper.innerHTML += `<li class="page-item"><a class="page-link" href="#" onclick="loadData(${page}, true)">${page}</a></li>`;
        }
    });

    if (currentPage < totalPages) {
        paginationWrapper.innerHTML += `<li class="page-item"><a class="page-link" href="#" onclick="loadData(${currentPage + 1}, true)">Trang Sau</a></li>`;
        paginationWrapper.innerHTML += `<li class="page-item"><a class="page-link" href="#" onclick="loadData(${totalPages}, true)">»</a></li>`;
    }
};

const getPaginationRange = (currentPage, totalPages, delta = 2) => {
    const range = [];
    const rangeWithDots = [];
    const leftTruncate = currentPage - delta > 2;
    const rightTruncate = currentPage + delta < totalPages - 1;

    if (leftTruncate) {
        range.push(1);
        range.push('...');
    }

    for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
        range.push(i);
    }

    if (rightTruncate) {
        range.push('...');
        range.push(totalPages);
    }

    return range;
};
