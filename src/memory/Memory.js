export class Page {
    arrival = 0;
    lastUsed = 0;
    id = 0;

    constructor(arrival, lastUsed, id) {
        this.arrival = arrival;
        this.lastUsed = lastUsed;
        this.id = id;
    }
}

export const PAGE_SIZE = 4;
export const MEMORY_SIZE = 200;
export const MEMORY_CAPACITY = Math.ceil(MEMORY_SIZE / PAGE_SIZE);

export class Memory {

    algorithm = 'fifo';
    pages = [];

    constructor(algorithm = 'fifo') {
        this.algorithm = algorithm;
        for (var i = 0; i < MEMORY_CAPACITY; i++) {
            this.pages.push([new Page(0, 0, 0)]);
        }
    }

    #freeCount() {
        return this.#loadedPagesCount(0);
    }

    #loadedPagesCount(id) {
        var count = 0;
        this.pages.forEach(p => {
            if (p[p.length - 1].id === id) count++;
        })
        return count;
    }
    #getFirstFree() {

        for (var i = 0; i < MEMORY_CAPACITY; i++) {
            if (this.pages[i][this.pages[i].length - 1].id === 0) return this.pages[i];
        }
        return null;
    }
    #getVictim(id) {
        var page = null;
        if (this.algorithm === 'fifo') {
            this.pages.forEach(p => {
                var last = p[p.length - 1];
                if (last.id != id && (page == null || last.arrival < page[page.length - 1].arrival)) page = p;
            });
        } else {
            this.pages.forEach(p => {
                var last = p[p.length - 1];
                if (last.id != id && (page == null || last.lastUsed < page[page.length - 1].lastUsed)) page = p;
            });
        }
        return page;
    }
    #load(id, time) {
        var page = this.#getFirstFree();
        if (page) {
            page.push(new Page(time, time, id));
        } else {
            page = this.#getVictim(id);
            page.push(new Page(time, time, id));
        }
    }
    #update(id, time) {
        this.pages.forEach(p => {
            if (p[p.length - 1].id === id) p[p.length - 1].lastUsed = time;
        })
    }
    setMemory(process, time) {
        var loaded = this.#loadedPagesCount(process.id);
        var free = this.#freeCount();

        if (loaded === process.paginas) {
            this.#update(process.id, time);
            return false;
        }
        else if (loaded + free >= process.paginas) {
            for (var i = 0; i < process.paginas - loaded; i++)
                this.#load(process.id, time);
            this.#update(process.id, time);
            return false;
        }
        for (var i = 0; i < free; i++)
            this.#load(process.id, time);
        this.#load(process.id, time + 1);
        return true;
    }
    free(process, time) {
        this.pages.forEach(p => {
            if (p[p.length - 1].id === process.id) p.push(new Page(time, time, 0));
        })
    }
    getMemoryState(time) {
        return this.pages.map(p => {
            var index = p.length - 1;
            while (p[index].arrival > time) index--;
            return p[index].id;
        });
    }
    getMemoryUse(time) {
        var count = 0;
        this.pages.forEach(p => {
            var index = p.length - 1;
            while (p[index].arrival > time) index--;
            if (p[index].id) count++;
        });
        return count;
    }
}