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
    constructor(size = 200, pageSize = 4, alogirthm = 'fifo') {
        this.algorithm = alogirthm;
        this.capacity = Math.ceil(size / pageSize);
        this.pages = new Array(this.capacity).fill(null);
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

            this.pages[pageIndex] = new Page(proccessName);
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

        return index;
    }
}