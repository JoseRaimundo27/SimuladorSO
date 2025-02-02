let pageCounter = 0;

export class Page {
    victim = false;
    loading = false;
    using = false;

    markAsVictim() {
        const clone = new Page(this.name);
        clone.victim = true;
        return clone;
    }

    markAsLoading() {
        const clone = new Page(this.name);
        clone.loading = true;
        return clone;
    }

    markAsUsing() {
        const clone = new Page(this.name);
        clone.using = true;
        return clone;
    }

    constructor(name) {
        this.name = name;
        this.creationTime = pageCounter;
        this.lastAccessTime = pageCounter;
        pageCounter++;
    }
}

export const PAGE_SIZE = 4;
export const MEMORY_SIZE = 200;
export const MEMORY_CAPACITY = Math.ceil(MEMORY_SIZE / PAGE_SIZE);

export class Memory {
    /**
     * @type {{'fifo'|'lru'}
     */
    alogirthm = 'fifo';

    /**
     * @type {(Page|null)[]}
     */
    pages = [];

    /**
     * @type {(Page|null)[]}
     */
    disk = [];

    /**
     * @type {{ pages: (Page|null)[], disk: (Page|null)[] }[]}
     */
    history = [];

    /**
     * @type {Page[]}
     */
    #killed = [];

    /**
     * @param {number} size 
     * @param {number} pageSize 
     * @param {'fifo'|'lru'} alogirthm 
     */
    constructor(alogirthm = 'fifo') {
        this.algorithm = alogirthm;
        this.pages = new Array(MEMORY_CAPACITY).fill(null);
        this.disk = [];
    }

    /**
     * @param {any} processName 
     * @param {"page_fault"|undefined} pageFault 
     */
    saveHistory(processName = null, pageFault) {
        const last = this.history[this.history.length - 1];
        const incoming = {
            pages: [...this.pages],
            disk: [...this.disk]
        };

        this.history.push(incoming);

        for (let i = 0; i < incoming.pages.length; i++) {
            const newPage = incoming?.pages[i];
            const oldPage = last?.pages[i];

            if (newPage && newPage.name === processName) {
                if (pageFault) {
                    incoming.pages[i] = newPage.markAsLoading();
                } else {
                    incoming.pages[i] = newPage.markAsUsing();
                }
            } 
            
            if (oldPage && newPage && newPage.name !== oldPage?.name && this.#killed.includes(oldPage)) {
                last.pages[i] = oldPage.markAsVictim();
            }
        }
    }

    unload(proccessName) {
        this.pages.forEach((page) => {
            if (page?.name === proccessName) {
                this.pages[this.pages.indexOf(page)] = null;
            }
        });
    }

    isLoaded(processName, numPages) {
        return this.pages.filter((page) => page?.name === processName).length >= numPages;
    }

    load(processName, numPages) {
        let pageFaultCounter = 0;
        
        this.pages.forEach((page) => {
            if (page?.name === processName) {
                page.lastAccessTime = pageCounter;
            }
        });

        const loadedPages = this.pages.filter((page) => page?.name === processName).length;

        for (let i = 0; i < numPages - loadedPages; i++) {
            let pageIndex = this.pages.findIndex((p) => p === null);

            if (pageIndex < 0) {
                this.saveHistory(processName, "page_fault");
                pageFaultCounter++;
                pageIndex = this.#killPage();
                // console.log("PAGE FAULT", processName, this.pages.map((p) => p?.name), pageFaultCounter);
            }

            const newPage = new Page(processName);

            this.pages[pageIndex] = newPage;

            if (this.disk.includes(newPage)) {
                this.disk.splice(this.disk.indexOf(newPage), 1);
            }
        }

        return pageFaultCounter;
    }

    #killPage() {
        switch (this.algorithm.toLowerCase()) {
            case 'fifo':
            default:
                return this.#killPageFIFO();
            case 'lru':
                return this.#killPageLRU();
        }
    }

    #killPageFIFO() {
        const oldestPage = this.pages.reduce((oldest, page) => {
            if (page == null) return oldest;
            return page.creationTime < oldest.creationTime ? page : oldest;
        }, this.pages[0]);

        const index = this.pages.indexOf(oldestPage);
        this.pages[index] = null;

        if (!this.disk.includes(oldestPage)) {
            this.disk.push(oldestPage);
        }

        this.#killed.push(oldestPage);

        return index;
    }

    #killPageLRU() {
        const oldestPage = this.pages.reduce((oldest, page) => {
            if (page == null) return oldest;
            return page.lastAccessTime < oldest.lastAccessTime ? page : oldest;
        }, this.pages[0]);

        const index = this.pages.indexOf(oldestPage);
        this.pages[index] = null;

        if (!this.disk.includes(oldestPage)) {
            this.disk.push(oldestPage);
        }

        this.#killed.push(oldestPage);

        return index;
    }
}