//
//  page_detector.js
//  XiaohonshuFiltration
//
//  Created by yangzicheng on 2026/9/24.
//

const NOTEDETAIL_PATH = "/explore/"

function detectNoteDetail() {
    const path = location.pathname;
    return path.startsWith(NOTEDETAIL_PATH);
}
