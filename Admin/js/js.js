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

    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('tableView').classList.remove('hidden');
    document.getElementById('tableName').textContent = name;

    const res = await post({ action: 'get_table', table: name, limit: PAGE_SIZE, offset });
    totalRows = res.total;
    primaryKey = res.columns[0] ?? 'id';

    document.getElementById('tableCount').textContent = ` (${totalRows.toLocaleString()} rows)`;

    const page = Math.floor(offset / PAGE_SIZE) + 1;
    const total = Math.ceil(totalRows / PAGE_SIZE) || 1;
    document.getElementById('pageInfo').textContent = `${page} / ${total}`;
    document.getElementById('prevBtn').disabled = offset === 0;
    document.getElementById('nextBtn').disabled = offset + PAGE_SIZE >= totalRows;

    renderHead(res.columns);
    renderBody(res.rows, res.columns);
}

async function loadUserTimePivot() {
    document.getElementById('tableCount').textContent = '';
    document.getElementById('pageInfo').textContent = '';
    document.getElementById('prevBtn').disabled = true;
    document.getElementById('nextBtn').disabled = true;

    const res = await post({ action: 'get_user_time_pivot' });

    const thead = document.getElementById('tableHead');
    const tbody = document.getElementById('tableBody');
    thead.innerHTML = '';
    tbody.innerHTML = '';

    if (!res.weeks.length) {
        tbody.innerHTML = '<tr><td style="text-align:center;padding:24px;color:#bbb">No data yet</td></tr>';
        return;
    }

    // Fixed column headers: User ID + 7 day names (set from first week)
    const dayNames = res.weeks[0].days.map(d => d.split(' ')[0]); // Mon, Tue, ...
    const tr = document.createElement('tr');
    ['User ID', ...dayNames].forEach(label => {
        const th = document.createElement('th');
        th.textContent = label;
        tr.appendChild(th);
    });
    thead.appendChild(tr);

    res.weeks.forEach(week => {
        // Week range header row
        const weekTr = document.createElement('tr');
        const weekTh = document.createElement('td');
        weekTh.colSpan = 8;
        weekTh.textContent = week.range;
        weekTh.style.cssText = 'background:#2a2a3a;color:#a78bfa;font-weight:bold;padding:6px 12px;font-size:0.85em;letter-spacing:0.05em;';
        weekTr.appendChild(weekTh);
        tbody.appendChild(weekTr);

        // Day date sub-header (actual dates like "Mar 3")
        const dateTr = document.createElement('tr');
        const emptyTd = document.createElement('td');
        emptyTd.style.cssText = 'background:#1e1e2e;';
        dateTr.appendChild(emptyTd);
        week.days.forEach(d => {
            const td = document.createElement('td');
            td.textContent = d.split(' ').slice(1).join(' '); // "Mar 3"
            td.style.cssText = 'background:#1e1e2e;color:#888;font-size:0.8em;text-align:center;padding:2px 8px;';
            dateTr.appendChild(td);
        });
        tbody.appendChild(dateTr);

        if (!week.users.length) {
            const emptyTr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 8;
            td.textContent = 'No users this week';
            td.style.cssText = 'text-align:center;color:#bbb;padding:8px;';
            emptyTr.appendChild(td);
            tbody.appendChild(emptyTr);
            return;
        }

        week.users.forEach(user => {
            const row = document.createElement('tr');
            const idTd = document.createElement('td');
            idTd.textContent = user.user_id;
            row.appendChild(idTd);
            user.days.forEach(secs => {
                const td = document.createElement('td');
                td.textContent = secs > 0 ? fmtSecs(secs) : '—';
                td.style.textAlign = 'center';
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });
    });
}

function fmtSecs(s) {
    if (s < 60) return s + 's';
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    return h > 0 ? h + 'h ' + (m % 60) + 'm' : m + 'm';
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
