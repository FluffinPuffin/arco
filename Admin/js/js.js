const API = '/api/admin.php';
const PAGE_SIZE = 50;

let currentTable = '', currentOffset = 0, totalRows = 0, primaryKey = 'id';

(async () => {
    const res = await post({ action: 'list_tables' });
    renderSidebar(res.tables);
})();

function renderSidebar(tables) {
    const nav = document.getElementById('tableList');
    nav.innerHTML = '';
    tables.forEach(name => {
        const btn = document.createElement('button');
        btn.className = 'table-btn';
        btn.textContent = name;
        btn.addEventListener('click', () => loadTable(name, 0, btn));
        nav.appendChild(btn);
    });
}

async function loadTable(name, offset, btnEl) {
    document.querySelectorAll('.table-btn').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    currentTable = name;
    currentOffset = offset;

    const res = await post({ action: 'get_table', table: name, limit: PAGE_SIZE, offset });
    totalRows = res.total;
    primaryKey = res.columns[0] ?? 'id';

    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('tableView').classList.remove('hidden');
    document.getElementById('tableName').textContent = name;
    document.getElementById('tableCount').textContent = ` (${totalRows.toLocaleString()} rows)`;

    const page = Math.floor(offset / PAGE_SIZE) + 1;
    const total = Math.ceil(totalRows / PAGE_SIZE) || 1;
    document.getElementById('pageInfo').textContent = `${page} / ${total}`;
    document.getElementById('prevBtn').disabled = offset === 0;
    document.getElementById('nextBtn').disabled = offset + PAGE_SIZE >= totalRows;

    renderHead(res.columns);
    renderBody(res.rows, res.columns);
}

function renderHead(columns) {
    const tr = document.createElement('tr');
    [...columns, 'Actions'].forEach(col => {
        const th = document.createElement('th');
        th.textContent = col;
        tr.appendChild(th);
    });
    const thead = document.getElementById('tableHead');
    thead.innerHTML = '';
    thead.appendChild(tr);
}

function renderBody(rows, columns) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    if (!rows.length) {
        tbody.innerHTML = `<tr><td colspan="${columns.length + 1}" style="text-align:center;padding:24px;color:#bbb">No rows</td></tr>`;
        return;
    }
    rows.forEach(row => {
        const tr = document.createElement('tr');
        const pkVal = row[primaryKey];
        columns.forEach((col, i) => {
            const td = document.createElement('td');
            const raw = row[col];
            const display = raw == null ? null : typeof raw === 'object' ? JSON.stringify(raw) : String(raw);
            if (i === 0) {
                td.textContent = display ?? '';
            } else {
                setCellDisplay(td, display);
                td.classList.add('editable');
                td.addEventListener('click', () => startEdit(td, col, pkVal, display));
            }
            td.title = display ?? '';
            tr.appendChild(td);
        });
        const actionTd = document.createElement('td');
        const delBtn = document.createElement('button');
        delBtn.className = 'btn-delete';
        delBtn.textContent = 'Delete';
        delBtn.addEventListener('click', () => deleteRow(pkVal, tr));
        actionTd.appendChild(delBtn);
        tr.appendChild(actionTd);
        tbody.appendChild(tr);
    });
}

function setCellDisplay(td, value) {
    td.innerHTML = value === null ? '<span class="null-val">null</span>' : '';
    if (value !== null) td.textContent = value;
    td.title = value ?? '';
}

function startEdit(td, col, pkVal, originalValue) {
    if (td.querySelector('input')) return;
    const input = document.createElement('input');
    input.className = 'cell-input';
    input.value = originalValue ?? '';
    td.innerHTML = '';
    td.appendChild(input);
    input.focus();
    input.select();

    const commit = async () => {
        const newVal = input.value;
        if (newVal === (originalValue ?? '')) { setCellDisplay(td, originalValue); return; }
        try {
            await post({ action: 'update_row', table: currentTable, pk: primaryKey, pk_val: pkVal, col, val: newVal });
            originalValue = newVal;
            setCellDisplay(td, newVal);
            td.classList.add('saved');
            setTimeout(() => td.classList.remove('saved'), 800);
        } catch (err) {
            alert('Save failed: ' + err.message);
            setCellDisplay(td, originalValue);
        }
    };

    input.addEventListener('keydown', e => {
        if (e.key === 'Enter')  { e.preventDefault(); commit(); }
        if (e.key === 'Escape') { e.preventDefault(); setCellDisplay(td, originalValue); }
    });
    input.addEventListener('blur', commit);
}

async function deleteRow(pkVal, rowEl) {
    if (!confirm(`Delete row where ${primaryKey} = ${pkVal}?`)) return;
    try {
        await post({ action: 'delete_row', table: currentTable, pk: primaryKey, pk_val: pkVal });
        rowEl.remove();
        totalRows--;
        document.getElementById('tableCount').textContent = ` (${totalRows.toLocaleString()} rows)`;
    } catch (err) {
        alert('Delete failed: ' + err.message);
    }
}

document.getElementById('migrateBtn').addEventListener('click', async () => {
    const btn = document.getElementById('migrateBtn');
    btn.textContent = 'Running…';
    btn.disabled = true;
    try {
        const res = await post({ action: 'run_migrations' });
        renderSidebar(res.tables);
        btn.textContent = 'Done!';
        setTimeout(() => { btn.textContent = 'Run Migrations'; btn.disabled = false; }, 2000);
    } catch (err) {
        alert('Migration failed: ' + err.message);
        btn.textContent = 'Run Migrations';
        btn.disabled = false;
    }
});

document.getElementById('prevBtn').addEventListener('click', () => loadTable(currentTable, Math.max(0, currentOffset - PAGE_SIZE)));
document.getElementById('nextBtn').addEventListener('click', () => loadTable(currentTable, currentOffset + PAGE_SIZE));

async function post(body) {
    const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
}
