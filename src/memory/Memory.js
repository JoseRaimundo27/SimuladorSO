let pageCounter = 0;

export class Page {
    constructor(name) {
        this.name = name;
        this.creationTime = pageCounter;
        this.lastAccessTime = pageCounter;
        pageCounter ++;
    }
}

export class Memory {
    /**
     * @param {number} size 
     * @param {number} pageSize 
     * @param {'fifo'|'lru'} alogirthm 
     */
    constructor(size = 200, pageSize = 4, alogirthm = 'fifo') {
        this.algorithm = alogirthm;
        this.capacity = Math.ceil(size / pageSize);
        this.pages = new Array(this.capacity).fill(null);
        this.disk = [];
    }

    load(proccessName, numPages = 10) {
        let pageFaultCounter = 0;

        this.pages.forEach((page) => {
            if (page?.name === proccessName) {
                page.lastAccessTime = pageCounter;
            }
        });

        for (let i = 0; i < numPages; i++) {
            let pageIndex = this.pages.findIndex((p) => p === null);

            if (pageIndex < 0) {
                pageFaultCounter ++;
                pageIndex = this.killPage();
            }

            const newPage = new Page(proccessName);

            this.pages[pageIndex] = newPage;

            if (this.disk.includes(newPage)) {
                this.disk.splice(this.disk.indexOf(newPage), 1);
            }
        }

        return pageFaultCounter;
    }

    killPage() {
        switch (this.algorithm.toLowerCase()) {
            case 'fifo':   
            default:
                return this.killPageFIFO();
            case 'lru':
                return this.killPageLRU();
        }
    }

    killPageFIFO() {
        const oldestPage = this.pages.reduce((oldest, page) => {
            if (page === null) {
                return oldest;
            }
            return page.creationTime < oldest.creationTime ? page : oldest;
        }, this.pages[0]);

        const index = this.pages.indexOf(oldestPage);
        this.pages[index] = null;

        if (!this.disk.includes(oldestPage)) {
            this.disk.push(oldestPage);
        }

        return index;
    }

    killPageLRU() {
        const oldestPage = this.pages.reduce((oldest, page) => {
            if (page === null) {
                return oldest;
            }
            return page.lastAccessTime < oldest.lastAccessTime ? page : oldest;
        }, this.pages[0]);

        const index = this.pages.indexOf(oldestPage);
        this.pages[index] = null;

        if (!this.disk.includes(oldestPage)) {
            this.disk.push(oldestPage);
        }

        return index;
    }
}