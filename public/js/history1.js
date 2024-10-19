document.addEventListener('DOMContentLoaded', function () {
    const filterForm = document.getElementById('filterForm');
    const deviceHistoryTableBody = document.getElementById('deviceTable').getElementsByTagName('tbody')[0];
    const paginationWrapper = document.getElementById('paginationWrapper');
    
    if (!deviceHistoryTableBody) {
        console.error('Không tìm thấy phần tử bảng với ID "deviceTable".');
        return;
    }
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has('page')) {
        loadData(1, false);
    } else {
        loadData(urlParams.get('page'));
    }

    filterForm.addEventListener('submit', function (e) {
        e.preventDefault();
        loadData(1, true); 
    });
});

const loadData = async (page = 1, updateUrl = true) => {
    const filterForm = document.getElementById('filterForm');
    const deviceHistoryTableBody = document.getElementById('deviceTable').getElementsByTagName('tbody')[0];

    const formData = new FormData(filterForm);
    formData.append('page', page);
    const params = new URLSearchParams(formData).toString();
    if (updateUrl) {
        const newUrl = `${window.location.pathname}?${params}`;
        history.pushState(null, '', newUrl);
    }

    try {
        const response = await axios.get(`/api/deviceData?${params}`);
        const { data, currentPage, totalPages, limit } = response.data;

        deviceHistoryTableBody.innerHTML = '';

        data.forEach((item, index) => {
            const stt = (currentPage - 1) * limit + index + 1;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${stt}</td>
                <td>${item.name}</td>
                <td>${item.status === 'on' ? 'Bật' : 'Tắt'}</td>
                <td>${item.day} ${item.hour}</td>
            `;
            deviceHistoryTableBody.appendChild(row);
        });

        updatePagination(currentPage, totalPages);

    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

const updatePagination = (currentPage, totalPages) => {
    const paginationWrapper = document.getElementById('paginationWrapper');
    paginationWrapper.innerHTML = '';

    if (totalPages <= 1) return;

    if (currentPage > 1) {
        const firstLi = document.createElement('li');
        firstLi.classList.add('page-item');
        firstLi.innerHTML = `<a class="page-link" href="#">&laquo;</a>`;
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
        lastLi.innerHTML = `<a class="page-link" href="#">&raquo;</a>`;
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
document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('.nav-link'); 
  
    links.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault(); 
  
        const href = this.getAttribute('href');
        document.querySelector('body').classList.add('fade-out'); 
  
        setTimeout(() => {
          window.location.href = href; 
        }, 500);
      });
    });
  
    document.body.classList.add('fade-in');
  });
  