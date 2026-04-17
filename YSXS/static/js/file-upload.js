// 在文件顶部定义全局变量（确保在其他函数之前）
let categoryList = []; // 文献分类列表
let docTypeList = [];  // 文献类型列表

// 页面加载完成后请求分类数据
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 从后端接口获取分类数据
    const response = await fetch('/get-category-data', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 'X-CSRFToken': getCSRFToken() // 携带CSRF令牌（如果后端需要）
      }
    });

    if (!response.ok) {
      throw new Error('获取分类数据失败');
    }

    const data = await response.json();
    // 赋值给全局变量
    categoryList = (data.category_list || []).map(cat => ({
      id: cat.id,
      value: cat.value,
      label: cat.label
    }));
    docTypeList = data.doc_type_list || [];
    console.log('分类数据加载成功', { categoryList, docTypeList });
  } catch (error) {
    console.error('加载分类数据出错:', error);
    //  fallback：如果接口失败，使用默认值避免功能失效
    categoryList = [
      { id: 1, value: "computer", label: "计算机科学" },
      { id: 2, value: "ai", label: "人工智能" },
      { id: 3, value: "other", label: "其他" }
    ];
    docTypeList = [
      ["journal", "期刊论文"],
      ["conference", "会议论文"],
      ["other", "其他"]
    ];
  }
});

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM加载完成，初始化上传组件');
    // 获取DOM元素
    const dropArea = document.getElementById('drop-area');
    const fileUpload = document.getElementById('file-upload');
    const uploadBtn = document.getElementById('upload-btn');
    const browseFiles = document.getElementById('browse-files');
    const fileList = document.getElementById('file-list');
    const fileCount = document.getElementById('file-count');
    const fileItems = document.getElementById('file-items');
    const clearFileBtn = document.getElementById('clear-file-btn');
    const toggleFiles = document.getElementById('toggle-files');
    const fileItemsContainer = document.getElementById('file-items-container');
    const uploadForm = document.getElementById('upload-form');
    const uploadProgress = document.getElementById('upload-progress');
    const progressBar = document.getElementById('progress-bar');
    const progressPercent = document.getElementById('progress-percent');
    const uploadStatus = document.getElementById('upload-status');
    const statusText = document.getElementById('status-text');
    const uploadResult = document.getElementById('upload-result');
    const cancelUpload = document.getElementById('cancel-upload');
    const closeModal = document.getElementById('close-modal');
    const uploadModal = document.getElementById('upload-modal');
    const submitUpload = document.getElementById('submit-upload');
    
    // 全局变量：控制并发解析数量
    let parsingQueue = [];
    const MAX_PARALLEL_PARSE = 3; // 最多同时解析3个文件
    let currentXhr = null;
    let isUploading = false;
    let shouldCloseAfterAbort = false;
    const submitButtonOriginalText = submitUpload ? submitUpload.textContent : '';
    const cancelButtonOriginalText = cancelUpload ? cancelUpload.textContent : '';

    let fileIdMapInput = document.querySelector('input[name="file_id_map"]');
    if (!fileIdMapInput) {
        fileIdMapInput = document.createElement('input');
        fileIdMapInput.type = 'hidden';
        fileIdMapInput.name = 'file_id_map';
        uploadForm.appendChild(fileIdMapInput);
    }

    // 检查DOM元素是否存在
    console.log('关键元素检查:', {
        dropArea: !!dropArea,
        fileUpload: !!fileUpload,
        uploadForm: !!uploadForm,
        submitButton: !!uploadBtn,
        csrfToken: !!getCSRFToken()
    });

    // 存储已选择的文件
    let selectedFiles = [];

    // 上传按钮点击事件
    uploadBtn.addEventListener('click', () => {
        console.log('上传按钮被点击');
        uploadModal.classList.remove('hidden');
        // uploadForm.submit();
    });

    // 浏览文件按钮点击事件
    browseFiles.addEventListener('click', () => {
        console.log('浏览文件按钮被点击');
        fileUpload.click();
    });

    // 文件选择事件
    fileUpload.addEventListener('change', (e) => {
        console.log('文件选择事件触发，选择了', e.target.files.length, '个文件');
        handleFiles(e.target.files);
        // 重置input值，以便能重复选择同一文件
        fileUpload.value = '';
    });

    // 拖放事件处理
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        dropArea.classList.add('border-blue-500', 'bg-blue-50');
    }

    function unhighlight() {
        dropArea.classList.remove('border-blue-500', 'bg-blue-50');
    }

    // 处理拖放文件
    dropArea.addEventListener('drop', (e) => {
        console.log('拖放文件事件触发，选择了', e.dataTransfer.files.length, '个文件');
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }, false);

    // 更新file_id_map的函数（放在handleFiles之前）
    function updateFileIdMap() {
        // 从selectedFiles中提取所有file.id
        const fileIds = selectedFiles.map(file => file.id);
        // 转为JSON字符串存入隐藏字段
        fileIdMapInput.value = JSON.stringify(fileIds);
        console.log('更新file_id_map:', fileIds);
    }

    // 处理选择的文件
    function handleFiles(files) {
        if (files.length === 0) return;
        console.log('处理文件事件触发，选择了', files.length, '个文件');

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // 验证文件大小
            if (file.size > 50 * 1024 * 1024) {
                console.log(`文件 "${file.name}" 大小不能超过50MB`);
                alert(`文件 "${file.name}" 大小不能超过50MB`);
                continue;
            }

            // 验证文件类型
            const ext = file.name.split('.').pop().toLowerCase();
            const allowedExts = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt'];
            if (!allowedExts.includes(ext)) {
                console.log(`文件 "${file.name}" 类型不支持，仅支持${allowedExts.join(', ')}`);
                alert(`文件 "${file.name}" 类型不支持，仅支持${allowedExts.join(', ')}`);
                continue;
            }

            // 检查是否已添加该文件
            const isDuplicate = selectedFiles.some(f => 
                f.name === file.name && f.size === file.size && f.lastModified === file.lastModified
            );
            
            if (!isDuplicate) {
                // 为文件添加唯一ID
                file.id = 'file_' + Date.now() + '_' + i;
                selectedFiles.push(file);
                console.log(`文件 "${file.name}" 已添加到列表`);
                addFileToDOM(file);
            }
        }

        updateFileCount();
        fileList.classList.remove('hidden');
        updateFileIdMap(); // 新增：添加文件后更新ID列表
    }

    // 将文件添加到DOM
    function addFileToDOM(file) {
        const ext = file.name.split('.').pop().toLowerCase();
        const fileIcon = getFileIcon(ext);
        const fileSize = formatFileSize(file.size);
        
        const fileItem = document.createElement('div');
        fileItem.className = 'border border-slate-200 rounded-lg overflow-hidden';
        fileItem.dataset.fileId = file.id;
        
        // 文件信息头部
        const fileHeader = document.createElement('div');
        fileHeader.className = 'p-3 flex justify-between items-center bg-slate-50';
        fileHeader.innerHTML = `
            <div class="flex items-center">
                <i class="fa ${fileIcon} text-blue-500 mr-2"></i>
                <div>
                    <div class="text-sm font-medium text-slate-800 truncate max-w-xs">${file.name}</div>
                    <div class="text-xs text-slate-500">${fileSize}</div>
                </div>
            </div>
            <div class="flex space-x-1">
                <button type="button" class="toggle-details p-1 text-slate-500 hover:text-blue-600" title="查看详情">
                    <i class="fa fa-chevron-down"></i>
                </button>
                <button type="button" class="remove-file p-1 text-slate-500 hover:text-red-600" title="移除文件">
                    <i class="fa fa-times"></i>
                </button>
            </div>
        `;
        
        // 文件详情区域（重点修改）
        const fileDetails = document.createElement('div');
        // 1. 调整容器样式：增加最小高度和内边距，移除hidden默认状态（可选）
        fileDetails.className = 'file-details hidden p-4 border-t border-slate-200 bg-white min-h-[800px]';
        // fileDetails.innerHTML = `
        //     <div class="text-sm text-slate-500 mb-3">
        //         <i class="fa fa-spinner fa-spin mr-1"></i> 正在解析文件信息...
        //     </div>
        //     <div class="file-info-form grid grid-cols-1 md:grid-cols-2 gap-6 hidden">
        //         <div>
        //             <label class="block text-xs font-medium text-slate-700 mb-1">文献标题 <span class="text-red-500">*</span></label>
        //             <input type="text" name="doc-title[${file.id}]" class="doc-title w-full px-3 py-1 text-sm rounded border border-slate-300" required>
        //         </div>
        //         <div>
        //             <label class="block text-xs font-medium text-slate-700 mb-1">作者 <span class="text-red-500">*</span></label>
        //             <input type="text" name="doc-authors[${file.id}]" class="doc-authors w-full px-3 py-1 text-sm rounded border border-slate-300" required>
        //         </div>
        //         <div>
        //             <label class="block text-xs font-medium text-slate-700 mb-1">期刊/会议</label>
        //             <input type="text" name="doc-journal[${file.id}]" class="doc-journal w-full px-3 py-1 text-sm rounded border border-slate-300">
        //         </div>
        //         <div>
        //             <label class="block text-xs font-medium text-slate-700 mb-1">年份</label>
        //             <input type="number" name="doc-year[${file.id}]" class="doc-year w-full px-3 py-1 text-sm rounded border border-slate-300">
        //         </div>
        //         <div>
        //             <label class="block text-xs font-medium text-slate-700 mb-1">文献分类 <span class="text-red-500">*</span></label>
        //             <!-- 2. 设置默认值为"other"（其他） -->
        //             <select name="doc-category-id[${file.id}]" class="doc-category w-full px-3 py-1 text-sm rounded border border-slate-300" required>
        //                 <option value="">请选择分类</option>
        //                 {% for value, label in Document.category_list %}
        //                     <option value="{{ value }}">{{ label }}</option>
        //                 {% endfor %}
        //             </select>
        //         </div>
        //         <div>
        //             <label class="block text-xs font-medium text-slate-700 mb-1">文献类型 <span class="text-red-500">*</span></label>
        //             <!-- 3. 设置默认值为"journal"（期刊论文） -->
        //             <select name="doc-type[${file.id}]" class="doc-type w-full px-3 py-1 text-sm rounded border border-slate-300" required>
        //                 <option value="">请选择类型</option>
        //                 {% for value, label in Document.doc_type_list %}
        //                     <option value="{{ value }}">{{ label }}</option>
        //                 {% endfor %}
        //             </select>
        //         </div>
        //         <div class="md:col-span-2">
        //             <label class="block text-xs font-medium text-slate-700 mb-1">关键词（用逗号分隔）</label>
        //             <input type="text" name="doc-keywords[${file.id}]" class="doc-keywords w-full px-3 py-1 text-sm rounded border border-slate-300">
        //         </div>
        //         <div class="md:col-span-2">
        //             <label class="block text-xs font-medium text-slate-700 mb-1">摘要</label>
        //             <!-- 4. 增加摘要输入框高度，显示更多内容 -->
        //             <textarea name="doc-abstract[${file.id}]" class="doc-abstract w-full px-3 py-1 text-sm rounded border border-slate-300" rows="5"></textarea>
        //         </div>
        //     </div>
        // `;
        


        // 动态生成分类和类型选项（从全局变量获取后端数据）
        let categoryOptions = '<option value="">请选择分类</option>';
        categoryList.forEach((cat) => {
            const selected = cat.value === 'other' ? 'selected' : '';
            categoryOptions += `<option value="${cat.id}" data-slug="${cat.value}" ${selected}>${cat.label}</option>`;
        });

        let typeOptions = '<option value="">请选择类型</option>';
        docTypeList.forEach(([value, label]) => {
            // 设置默认值为"journal"
            const selected = value === 'journal' ? 'selected' : '';
            typeOptions += `<option value="${value}" ${selected}>${label}</option>`;
        });

        fileDetails.innerHTML = `
            <div class="text-sm text-slate-500 mb-3">
                <i class="fa fa-spinner fa-spin mr-1"></i> 正在解析文件信息...
            </div>
            <div class="file-info-form grid grid-cols-1 md:grid-cols-2 gap-6 hidden">
                <div>
                    <label class="block text-xs font-medium text-slate-700 mb-1">文献标题 <span class="text-red-500">*</span></label>
                    <input type="text" name="doc-title[${file.id}]" class="doc-title w-full px-3 py-1 text-sm rounded border border-slate-300" required>
                </div>
                <div>
                    <label class="block text-xs font-medium text-slate-700 mb-1">作者 <span class="text-red-500">*</span></label>
                    <input type="text" name="doc-authors[${file.id}]" class="doc-authors w-full px-3 py-1 text-sm rounded border border-slate-300" required>
                </div>
                <div>
                    <label class="block text-xs font-medium text-slate-700 mb-1">期刊/会议</label>
                    <input type="text" name="doc-journal[${file.id}]" class="doc-journal w-full px-3 py-1 text-sm rounded border border-slate-300">
                </div>
                <div>
                    <label class="block text-xs font-medium text-slate-700 mb-1">年份</label>
                    <input type="number" name="doc-year[${file.id}]" class="doc-year w-full px-3 py-1 text-sm rounded border border-slate-300">
                </div>
                <div>
                    <label class="block text-xs font-medium text-slate-700 mb-1">文献分类 <span class="text-red-500">*</span></label>
                    <select name="doc-category-id[${file.id}]" class="doc-category w-full px-3 py-1 text-sm rounded border border-slate-300" required>
                        ${categoryOptions} <!-- 替换模板语法为动态生成的选项 -->
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-medium text-slate-700 mb-1">文献类型 <span class="text-red-500">*</span></label>
                    <select name="doc-type[${file.id}]" class="doc-type w-full px-3 py-1 text-sm rounded border border-slate-300" required>
                        ${typeOptions} <!-- 替换模板语法为动态生成的选项 -->
                    </select>
                </div>
                <div class="thesis-degree-wrapper hidden">
                    <label class="block text-xs font-medium text-slate-700 mb-1">学位类型</label>
                    <select name="doc-thesis-degree[${file.id}]" class="doc-thesis-degree w-full px-3 py-1 text-sm rounded border border-slate-300">
                        <option value="">未指定</option>
                        <option value="master">硕士</option>
                        <option value="phd">博士</option>
                    </select>
                </div>
                <div class="md:col-span-2">
                    <label class="block text-xs font-medium text-slate-700 mb-1">关键词（用逗号分隔）</label>
                    <input type="text" name="doc-keywords[${file.id}]" class="doc-keywords w-full px-3 py-1 text-sm rounded border border-slate-300">
                </div>
                <div class="md:col-span-2">
                    <label class="block text-xs font-medium text-slate-700 mb-1">摘要</label>
                    <textarea name="doc-abstract[${file.id}]" class="doc-abstract w-full px-3 py-1 text-sm rounded border border-slate-300" rows="5"></textarea>
                </div>
            </div>
        `;

        fileItem.appendChild(fileHeader);
        fileItem.appendChild(fileDetails);
        fileItems.appendChild(fileItem);

        function syncThesisDegreeVisibility() {
            const docTypeEl = fileItem.querySelector('.doc-type');
            const wrapper = fileItem.querySelector('.thesis-degree-wrapper');
            if (!docTypeEl || !wrapper) return;
            const value = String(docTypeEl.value || '').trim().toLowerCase();
            wrapper.classList.toggle('hidden', value !== 'thesis');
        }

        // 为文件添加事件监听
        const toggleBtn = fileItem.querySelector('.toggle-details');
        const removeBtn = fileItem.querySelector('.remove-file');
        const docTypeSelect = fileItem.querySelector('.doc-type');
        docTypeSelect?.addEventListener('change', syncThesisDegreeVisibility);
        syncThesisDegreeVisibility();
        
        toggleBtn.addEventListener('click', () => {
            fileDetails.classList.toggle('hidden');
            const icon = toggleBtn.querySelector('i');
            if (fileDetails.classList.contains('hidden')) {
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-chevron-down');
            } else {
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
                
            }
        });
        
        removeBtn.addEventListener('click', () => {
            // 从数组中移除文件
            selectedFiles = selectedFiles.filter(f => f.id !== file.id);
            // 从DOM中移除元素
            fileItem.remove();
            // 更新文件计数
            updateFileCount();
            updateFileIdMap(); // 新增：删除文件后更新ID列表
            // 如果没有文件了，隐藏文件列表
            if (selectedFiles.length === 0) {
                fileList.classList.add('hidden');
            }
        });
        // 解析文件信息,文件添加到DOM后立即自动解析，无需等待点击展开按钮
        // addToParsingQueue(file, fileItem);
        parseFileInfo(file, fileItem)
    }


    // 修改解析调用方式
    function addToParsingQueue(file, fileItem) {
        parsingQueue.push({file, fileItem});
        processParsingQueue();
    }

    function processParsingQueue() {
        if (parsingQueue.length === 0) return;
        if (document.querySelectorAll('.fa-spinner').length >= MAX_PARALLEL_PARSE) return;
        
        const {file, fileItem} = parsingQueue.shift();
        parseFileInfo(file, fileItem).then(() => {
            processParsingQueue(); // 完成一个后继续处理队列
        });
    }

    // 解析文件信息
    function parseFileInfo(file, fileItem) {
        console.log(`解析文件 "${file.name}" 信息`);
        const formData = new FormData();
        formData.append('file', file);
        
        fetch('/parse-file', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`解析文件失败，状态码：${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // 显示表单并填充解析的数据
            console.log(`文件 "${file.name}" 解析成功，数据为:`, data);
            const fileDetails = fileItem.querySelector('.file-details');
            const loadingIndicator = fileDetails.querySelector('.text-slate-500');
            const infoForm = fileDetails.querySelector('.file-info-form');
            
            loadingIndicator.classList.add('hidden');
            infoForm.classList.remove('hidden');
            
            // 填充解析的数据
            if (data.title) fileItem.querySelector('.doc-title').value = data.title;
            if (data.authors) fileItem.querySelector('.doc-authors').value = data.authors;
            if (data.journal) fileItem.querySelector('.doc-journal').value = data.journal;
            if (data.year) fileItem.querySelector('.doc-year').value = data.year;
            if (data.doi && fileItem.querySelector('.doc-doi')) fileItem.querySelector('.doc-doi').value = data.doi;
            if (data.keywords) fileItem.querySelector('.doc-keywords').value = data.keywords;
            if (data.abstract) fileItem.querySelector('.doc-abstract').value = data.abstract;
            if (data.category) {
                const targetOption = fileItem.querySelector(`.doc-category option[data-slug="${data.category}"]`);
                if (targetOption) {
                    fileItem.querySelector('.doc-category').value = targetOption.value;
                }
            }
            if (data.type && fileItem.querySelector(`.doc-type option[value="${data.type}"]`)) {
                fileItem.querySelector('.doc-type').value = data.type;
            }
            const wrapper = fileItem.querySelector('.thesis-degree-wrapper');
            const docTypeEl = fileItem.querySelector('.doc-type');
            if (wrapper && docTypeEl) {
                const value = String(docTypeEl.value || '').trim().toLowerCase();
                wrapper.classList.toggle('hidden', value !== 'thesis');
            }
        })
        .catch(error => {
            console.error('解析文件时出错:', error);
            const fileDetails = fileItem.querySelector('.file-details');
            fileDetails.innerHTML = `
                <div class="text-sm text-red-500 mb-3">
                    <i class="fa fa-exclamation-circle mr-1"></i> 解析文件信息失败，请手动输入
                </div>
                <div class="file-info-form grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-medium text-slate-700 mb-1">文献标题 <span class="text-red-500">*</span></label>
                        <input type="text" name="doc-title[${file.id}]" class="doc-title w-full px-3 py-1 text-sm rounded border border-slate-300" required>
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-slate-700 mb-1">作者 <span class="text-red-500">*</span></label>
                        <input type="text" name="doc-authors[${file.id}]" class="doc-authors w-full px-3 py-1 text-sm rounded border border-slate-300" required>
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-slate-700 mb-1">期刊/会议</label>
                        <input type="text" name="doc-journal[${file.id}]" class="doc-journal w-full px-3 py-1 text-sm rounded border border-slate-300">
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-slate-700 mb-1">年份</label>
                        <input type="number" name="doc-year[${file.id}]" class="doc-year w-full px-3 py-1 text-sm rounded border border-slate-300">
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-slate-700 mb-1">文献分类 <span class="text-red-500">*</span></label>
                        <select name="doc-category-id[${file.id}]" class="doc-category w-full px-3 py-1 text-sm rounded border border-slate-300" required>
                            <option value="">请选择分类</option>
                            <option value="computer">计算机科学</option>
                            <option value="ai">人工智能</option>
                            <option value="math">数学建模</option>
                            <option value="physics">物理学</option>
                            <option value="biology">生物学</option>
                            <option value="other">其他</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-slate-700 mb-1">文献类型 <span class="text-red-500">*</span></label>
                        <select name="doc-type[${file.id}]" class="doc-type w-full px-3 py-1 text-sm rounded border border-slate-300" required>
                            <option value="">请选择类型</option>
                            <option value="journal">期刊论文</option>
                            <option value="conference">会议论文</option>
                            <option value="thesis">学位论文</option>
                            <option value="report">技术报告</option>
                            <option value="other">其他</option>
                        </select>
                    </div>
                    <div class="thesis-degree-wrapper hidden">
                        <label class="block text-xs font-medium text-slate-700 mb-1">学位类型</label>
                        <select name="doc-thesis-degree[${file.id}]" class="doc-thesis-degree w-full px-3 py-1 text-sm rounded border border-slate-300">
                            <option value="">未指定</option>
                            <option value="master">硕士</option>
                            <option value="phd">博士</option>
                        </select>
                    </div>
                    <div class="md:col-span-2">
                        <label class="block text-xs font-medium text-slate-700 mb-1">关键词（用逗号分隔）</label>
                        <input type="text" name="doc-keywords[${file.id}]" class="doc-keywords w-full px-3 py-1 text-sm rounded border border-slate-300">
                    </div>
                    <div class="md:col-span-2">
                        <label class="block text-xs font-medium text-slate-700 mb-1">摘要</label>
                        <textarea name="doc-abstract[${file.id}]" class="doc-abstract w-full px-3 py-1 text-sm rounded border border-slate-300" rows="3"></textarea>
                    </div>
                </div>
            `;
            const docTypeEl = fileItem.querySelector('.doc-type');
            const wrapper = fileItem.querySelector('.thesis-degree-wrapper');
            docTypeEl?.addEventListener('change', () => {
                if (!wrapper || !docTypeEl) return;
                const value = String(docTypeEl.value || '').trim().toLowerCase();
                wrapper.classList.toggle('hidden', value !== 'thesis');
            });
        });
    }

    // 获取CSRF令牌（根据你的框架实现）
    function getCSRFToken() {
        console.log('获取CSRF令牌');
        // 如果你使用Flask-WTF，通常会在meta标签中设置csrf_token
        const meta = document.querySelector('meta[name="csrf-token"]');
        return meta ? meta.content : '';
    }

    // 更新文件计数
    function updateFileCount() {
        fileCount.textContent = selectedFiles.length;
    }

    // 清除所有文件
    clearFileBtn.addEventListener('click', () => {
        console.log('清除所有文件按钮点击');
        if (selectedFiles.length === 0) return;
        
        if (confirm(`确定要移除所有 ${selectedFiles.length} 个文件吗？`)) {
            console.log('清除所有文件');
            selectedFiles = [];
            fileItems.innerHTML = '';
            updateFileCount();
            fileList.classList.add('hidden');
            updateFileIdMap(); // 新增：清除文件后更新ID列表
        }
    });

    // 折叠/展开所有文件详情
    toggleFiles.addEventListener('click', () => {
        console.log('折叠/展开所有文件详情按钮点击');
        const icon = toggleFiles.querySelector('i');
        const allDetails = document.querySelectorAll('.file-details');
        
        if (icon.classList.contains('fa-chevron-up')) {
            // 折叠所有
            console.log('折叠所有文件详情');
            allDetails.forEach(detail => detail.classList.add('hidden'));
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
            toggleFiles.textContent = ' 展开';
            toggleFiles.prepend(icon);
        } else {
            // 展开所有
            console.log('展开所有文件详情');
            allDetails.forEach(detail => detail.classList.remove('hidden'));
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
            toggleFiles.textContent = ' 折叠';
            toggleFiles.prepend(icon);
            
            // 确保已解析所有文件信息
            selectedFiles.forEach(file => {
                console.log(`展开文件 "${file.name}" 详情`);
                const fileItem = document.querySelector(`[data-file-id="${file.id}"]`);
                if (fileItem && fileItem.querySelector('.file-info-form.hidden')) {
                    parseFileInfo(file, fileItem);
                }
            });
        }
    });

    // 表单提交处理
    submitUpload.addEventListener('click', (e) => {
        console.log('提交表单按钮点击');
        e.preventDefault(); // 阻止表单默认提交
        if (isUploading) return;

        // 验证是否选择了文件
        if (selectedFiles.length === 0) {
            alert('请选择至少一个文件');
            return;
        }
        
        // 验证版权协议
        const copyrightAgreement = uploadForm.querySelector('input[name="copyright_agreement"]');
        if (!copyrightAgreement.checked) {
            alert('请确认版权协议');
            return;
        }
        
        // 验证所有文件的必填字段
        let isValid = true;
        selectedFiles.forEach(file => {
            console.log(`验证文件 "${file.name}" 的必填字段`);
            const fileItem = document.querySelector(`[data-file-id="${file.id}"]`);
            const title = fileItem.querySelector('.doc-title').value.trim();
            const authors = fileItem.querySelector('.doc-authors').value.trim();
            const categoryId = fileItem.querySelector('.doc-category').value;
            const docType = fileItem.querySelector('.doc-type').value;
            
            if (!title || !authors || !categoryId || !docType) {
                isValid = false;
                // 展开有错误的文件
                fileItem.querySelector('.file-details').classList.remove('hidden');
                fileItem.querySelector('.toggle-details i').classList.remove('fa-chevron-down');
                fileItem.querySelector('.toggle-details i').classList.add('fa-chevron-up');
                
                // 高亮错误字段
                if (!title) fileItem.querySelector('.doc-title').classList.add('border-red-500');
                if (!authors) fileItem.querySelector('.doc-authors').classList.add('border-red-500');
                if (!categoryId) fileItem.querySelector('.doc-category').classList.add('border-red-500');
                if (!docType) fileItem.querySelector('.doc-type').classList.add('border-red-500');
                
                // 移除高亮效果
                setTimeout(() => {
                    if (!title) fileItem.querySelector('.doc-title').classList.remove('border-red-500');
                    if (!authors) fileItem.querySelector('.doc-authors').classList.remove('border-red-500');
                if (!categoryId) fileItem.querySelector('.doc-category').classList.remove('border-red-500');
                    if (!docType) fileItem.querySelector('.doc-type').classList.remove('border-red-500');
                }, 3000);
            }
        });
        
        if (!isValid) {
            alert('请完善所有文件的必填信息');
            return;
        }

        // 1. 创建空的FormData
        const formData = new FormData();

        // 2. 添加文件
        selectedFiles.forEach(file => {
            formData.append('file', file);
        });

        // 3. 添加文献元数据（标题、作者等）
        selectedFiles.forEach(file => {
            const fileItem = document.querySelector(`[data-file-id="${file.id}"]`);
            if (!fileItem) return;
            // 遍历当前文件的所有输入框，添加到FormData
            fileItem.querySelectorAll('input, select, textarea').forEach(input => {
                if (input.name) {
                    formData.append(input.name, input.value);
                }
            });
        });

        // 4. 添加版权协议
        formData.append('copyright_agreement', copyrightAgreement.checked ? 'on' : 'off');

        // 5. 添加file_id_map
        const fileIdMap = selectedFiles.map(file => ( file.id));
        formData.append('file_id_map', JSON.stringify(fileIdMap));
        // 输出 formData 中的内容，调试用
        for (const [key, value] of formData.entries()) {
            console.log(`FormData: ${key} = ${value}`);
        }

        function setButtonsDisabled(disabled) {
            if (submitUpload) {
                submitUpload.disabled = disabled;
                submitUpload.classList.toggle('opacity-70', disabled);
                submitUpload.classList.toggle('cursor-not-allowed', disabled);
            }
            if (closeModal) {
                closeModal.disabled = disabled;
                closeModal.classList.toggle('opacity-60', disabled);
                closeModal.classList.toggle('cursor-not-allowed', disabled);
            }
        }

        function setProgress(percentNumber) {
            const clamped = Math.max(0, Math.min(100, Number.isFinite(percentNumber) ? percentNumber : 0));
            if (progressBar) progressBar.style.width = `${clamped}%`;
            if (progressPercent) progressPercent.textContent = `${Math.round(clamped)}%`;
        }

        function setStatus(message) {
            if (statusText) statusText.textContent = message || '';
        }

        function showUploadUi() {
            if (uploadResult) {
                uploadResult.classList.add('hidden');
                uploadResult.textContent = '';
                uploadResult.classList.remove('bg-emerald-50', 'text-emerald-700', 'border', 'border-emerald-200');
                uploadResult.classList.remove('bg-rose-50', 'text-rose-700', 'border', 'border-rose-200');
            }
            if (uploadProgress) uploadProgress.classList.remove('hidden');
            if (uploadStatus) uploadStatus.classList.remove('hidden');
            setProgress(0);
            setStatus('正在上传，请稍候...');
            if (submitUpload) submitUpload.textContent = '上传中...';
            if (cancelUpload) cancelUpload.textContent = '取消上传';
            setButtonsDisabled(true);
        }

        function hideUploadUi() {
            if (uploadProgress) uploadProgress.classList.add('hidden');
            if (uploadStatus) uploadStatus.classList.add('hidden');
            setProgress(0);
            if (submitUpload) submitUpload.textContent = submitButtonOriginalText || '确认上传';
            if (cancelUpload) cancelUpload.textContent = cancelButtonOriginalText || '取消';
            setButtonsDisabled(false);
        }

        function showResult(type, message) {
            if (!uploadResult) return;
            uploadResult.textContent = message || '';
            uploadResult.classList.remove('hidden');
            if (type === 'success') {
                uploadResult.classList.add('bg-emerald-50', 'text-emerald-700', 'border', 'border-emerald-200');
            } else {
                uploadResult.classList.add('bg-rose-50', 'text-rose-700', 'border', 'border-rose-200');
            }
        }

        // 替换fetch为XMLHttpRequest，实现真实上传进度
        const xhr = new XMLHttpRequest();
        currentXhr = xhr;
        isUploading = true;
        showUploadUi();
        const uploadUrl = window.withBasePath ? window.withBasePath('/upload-multiple') : '/upload-multiple';
        xhr.open('POST', uploadUrl);
         
        // 上传进度监听（真实有效）
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const progress = (e.loaded / e.total) * 100;
                setProgress(progress);
            }
        });

        xhr.upload.addEventListener('load', () => {
            if (!isUploading) return;
            setProgress(100);
            setStatus('文件已上传，服务器处理中...');
        });

        // 响应处理
        xhr.onload = () => {
            let parsed = null;
            try {
                parsed = JSON.parse(xhr.responseText || '{}');
            } catch (err) {
                parsed = null;
            }
            const wasSuccess = xhr.status === 200;
            const errorMessage = parsed && (parsed.error || parsed.message) ? (parsed.error || parsed.message) : '上传失败';
            const successCount = parsed && typeof parsed.success_count === 'number' ? parsed.success_count : null;

            currentXhr = null;
            isUploading = false;
            hideUploadUi();

            if (wasSuccess) {
                const message = successCount === null ? '上传成功！' : `成功上传 ${successCount} 个文件！`;
                showResult('success', message);
                alert(message);
                closeUploadModal();
                window.location.reload();
                return;
            }
            showResult('error', '上传出错：' + errorMessage);
            alert('上传出错：' + errorMessage);
        };

        // 错误处理
        xhr.onerror = () => {
            currentXhr = null;
            isUploading = false;
            hideUploadUi();
            showResult('error', '网络错误，上传失败');
            alert('网络错误，上传失败');
        };

        xhr.onabort = () => {
            currentXhr = null;
            isUploading = false;
            hideUploadUi();
            showResult('error', '已取消上传');
            if (shouldCloseAfterAbort) {
                shouldCloseAfterAbort = false;
                closeUploadModal();
            }
        };
        

        console.log('FormData中文件数量-5:', formData.getAll('file').length); 

        // 发送请求（包含CSRF令牌，修复安全问题）
        xhr.setRequestHeader('X-CSRFToken', getCSRFToken());
        xhr.send(formData);
        console.log('开始上传文件');
    });

    // 关闭模态框函数
    function closeUploadModal() {
        console.log('关闭上传模态框');
        if (isUploading) return;
        uploadModal.classList.add('hidden');
        // 恢复页面滚动
        document.body.style.overflow = '';
        // 重置表单
        uploadForm.reset();
        // 清空文件
        selectedFiles = [];
        fileItems.innerHTML = '';
        updateFileCount();
        fileList.classList.add('hidden');
        // 隐藏进度条
        if (uploadProgress) uploadProgress.classList.add('hidden');
        if (uploadStatus) uploadStatus.classList.add('hidden');
        if (uploadResult) uploadResult.classList.add('hidden');
        if (progressBar) progressBar.style.width = '0%';
        if (progressPercent) progressPercent.textContent = '0%';
        if (submitUpload) {
            submitUpload.disabled = false;
            submitUpload.classList.remove('opacity-70', 'cursor-not-allowed');
            submitUpload.textContent = submitButtonOriginalText || '确认上传';
        }
        if (cancelUpload) cancelUpload.textContent = cancelButtonOriginalText || '取消';
        if (closeModal) {
            closeModal.disabled = false;
            closeModal.classList.remove('opacity-60', 'cursor-not-allowed');
        }
    }

    // 取消上传按钮
    cancelUpload.addEventListener('click', () => {
        if (isUploading && currentXhr) {
            shouldCloseAfterAbort = true;
            currentXhr.abort();
            return;
        }
        closeUploadModal();
    });
    
    // 关闭模态框按钮
    closeModal.addEventListener('click', () => {
        if (isUploading) return;
        closeUploadModal();
    });

    // 辅助函数：获取文件图标
    function getFileIcon(ext) {
        console.log(`获取文件 "${ext}" 的图标`);
        const iconMap = {
            'pdf': 'fa-file-pdf-o',
            'doc': 'fa-file-word-o',
            'docx': 'fa-file-word-o',
            'ppt': 'fa-file-powerpoint-o',
            'pptx': 'fa-file-powerpoint-o',
            'txt': 'fa-file-text-o'
        };
        return iconMap[ext] || 'fa-file-o';
    }

    // 辅助函数：格式化文件大小
    function formatFileSize(bytes) {
        console.log(`格式化文件大小 ${bytes} Bytes`);
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
});
    
