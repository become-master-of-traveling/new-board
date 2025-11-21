let notes = JSON.parse(localStorage.getItem("notes") || "[]");
let userAvatar = localStorage.getItem("userAvatar") || "photo.png";
const board = document.getElementById("board");

const NOTE_WIDTH = 220;  // 便利貼寬度
const GAP = 30;           // 便利貼間距
const MARGIN = 10;        // 左右邊距
const START_Y = 80;       // 新增按鈕下方起始位置

/* 載入便利貼 */
notes.forEach(n => createNote(n));
arrangeNotes();

/* 新增便利貼 */
function addNote() {
    const note = {
        id: Date.now(),
        text: "",
        color: "color" + (Math.floor(Math.random() * 5) + 1),
        avatar: userAvatar
    };

    notes.push(note);
    save();
    createNote(note);
    arrangeNotes();
}

/* 建立便利貼 DOM */
function createNote(n) {
    const div = document.createElement("div");
    div.className = "note " + n.color;
    div.style.width = NOTE_WIDTH + "px";
    div.dataset.id = n.id;

    div.innerHTML = `
        <span class="delete-btn" onclick="deleteNote(${n.id})">🗑️</span>
        <img class="avatar" src="${n.avatar}" onclick="changeAvatar(${n.id})">
        <textarea placeholder="寫點什麼吧 也可以點點看頭像喔!">${n.text}</textarea>
    `;

    board.appendChild(div);

    /* 儲存文字 */
    const textarea = div.querySelector("textarea");
    textarea.addEventListener("input", () => {
        let id = Number(div.dataset.id);
        let note = notes.find(n => n.id === id);
        note.text = textarea.value;
        save();
    });
}

/* 刪除便利貼 */
function deleteNote(id) {
    notes = notes.filter(n => n.id !== id);
    save();
    document.querySelector(`[data-id="${id}"]`).remove();
    arrangeNotes();
}

/* 儲存 */
function save() {
    localStorage.setItem("notes", JSON.stringify(notes));
}

/* 排列便利貼：先左到右，滿了換下一行 */
function arrangeNotes() {
    const boardWidth = board.clientWidth;
    let x = MARGIN;
    let y = START_Y;

    notes.forEach(n => {
        const el = document.querySelector(`[data-id="${n.id}"]`);

        if (x + NOTE_WIDTH > boardWidth - MARGIN) {
            // 換下一行
            x = MARGIN;
            y += el.offsetHeight + GAP;
        }

        el.style.left = x + "px";
        el.style.top = y + "px";

        n.x = x;
        n.y = y;

        x += NOTE_WIDTH + GAP; // 下一個便利貼的 X 位置
    });

    save();
}

/* 點頭像 → 換頭像 */
function changeAvatar(id) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = event => {
            const newAvatar = event.target.result;

            let note = notes.find(n => n.id === id);
            note.avatar = newAvatar;

            save();

            document.querySelector(`[data-id="${id}"] .avatar`).src = newAvatar;

            userAvatar = newAvatar;
            localStorage.setItem("userAvatar", newAvatar);
        };

        reader.readAsDataURL(file);
    };

    input.click();
}

/* 當視窗縮放時自動重新排列 */
window.addEventListener("resize", arrangeNotes);
