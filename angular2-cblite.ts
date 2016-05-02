import {Injectable} from 'angular2/core';
import {Http, Headers, RequestMethod, RequestOptionArgs, URLSearchParams, Response} from 'angular2/http';
import {Observable} from 'rxjs/Observable';

/*
interface ParsedUrl {
    auth: string;
    url:  string;
}
*/
@Injectable()
export class Cblite {

  private _auth: string;

  private _host: string;

  public db: string;
  
  public syncToken: string;

  // FIXME introduce checks for cblite and cordova
  // TODO do we still need to wait for deviceready?
  constructor(http: Http) {
    if (window.cblite) {
      window.cblite.getURL(function (err, url) {
            console.log(err, url);
            if (!err) {
              this._parseUrl(url);
            }
      });
    }
  }

  private _parseUrl(url: string) {

    let parsed = url.match(/^(https?:\/\/)(?:([^@]+)@)?([^:\/]+)(:[0-9]+)?\/$/);

    this._auth = (parsed[2] != '') ? 'Basic ' + window.btoa(parsed[2]) : '';
    this._host =  parsed[1] + parsed[3] + (parsed[4] || '') + '/';
  }

  private _call(method: RequestMethod, segs: string[], options?: RequestOptionArgs) : Observable {
    options = options || {};
    options.headers = new Headers({ 'Auhorization': this._auth });
    segs.unshift(this._host);

    console.log(segs);

    return Http.request(segs.join('/'), options)
        .map(res =>  res.json().data);
  }

  // Server level methods

  // GET /
  serverInfo() : Observable {
    return this._call(RequestMethod.GET, []);
  },

  // GET /_active_tasks
  activeTasks() : Observable {
    return this._call(RequestMethod.GET, ['_active_tasks']);
  },

  // GET _all_dbs
/*
  allDatabases: function () {
    var that = this;
    return openResource('_all_dbs').then(function (allDatabases) {
      return allDatabases.list().$promise.then(function (databaseNames) {
        return databaseNames.map(function (name) {
          return that.database(name);
        });
      });
    });
  },
*/

  // POST /_replicate
  replicateTo() : Observable {}
  replicateFrom() : Observable {}
  syncWith() : Observable {}

  selectDatabase(name: string) {
    this.db = name;
    return this;
  }

  // Database level methods

  // PUT /{db}
  // TODO treat a '412 Precondition Failed' as a success, but warn the caller?
  create() : Observable {
    return this._call(RequestMethod.PUT, [this.db]);
  }

  // GET /{db}
  info() : Observable {
    return this._call(RequestMethod.GET, [this.db]);
  }

  // DELETE /{db}
  delete() : Observable {
    return this._call(RequestMethod.DELETE, [this.db]);
  }

  // GET /{db}/_all_docs
  all(spec?: Map<string, string>) : Observable {
    return this._call(RequestMethod.GET, [this.db, '_all_docs'], spec);
  }

  // POST /{db}/_all_docs
  many(records: Array<string>) : Observable {
    return this._call(RequestMethod.POST, [this.db, '_all_docs'], records);
  }

  // POST /{db}/_bulk_docs
  // TODO implement
  // bulk() : Observable {}

  // GET /{db}/_changes
  changes(spec: Map<string: string>) : Observable {
    return this._call(RequestMethod.GET, [this.db, '_changes'], spec);
  }

  // POST /{db}/_compact
  compact() : Observable {
    return this._call(RequestMethod.POST, [this.db, '_compact']);
  }

  // undocumented, so skipping fo now. Leave as a placeholder
  // TODO implement
  // POST /{db}/_temp_view

  // POST /{db}
  createDocument(doc: Object, batch?: boolean) : Observable {
    let spec = {};
    return this._call(RequestMethod.POST, [this.db], spec);
  }

  // GET /{db}/{doc}
  retrieveDocument(id: string, spec: Map<string: string>) : Observable {
    return this._call(RequestMethod.GET, [this.db, id], spec);
  }

  // PUT /{db}/{doc}
  updateDocument(id: string, rev: string, doc: Object, batch?: boolean) : Observable {
    let spec = {};
    return this._call(RequestMethod.PUT, [this.db, id], spec);
  }

  // DELETE /{db}/{doc}
  deleteDocument(id: string, rev: string, batch?: boolean) : Observable {
    let spec = {};
    return this._call(RequestMethod.DELETE, [this.db, id], spec);
  }

  // DANGEROUS, so skipping for now. Leave as a placeholder
  // POST /{db}/purge
  // purge(id: string, revisions: string[]) : Observable {
  //   return this.call(RequestMethod.POST, [this.db, '_purge'], spec);
  // }


  // TODO attachment methods
  // PUT /{db}/{doc}/{attachment}
  // GET /{db}/{doc}/{attachment}
  // DELETE /{db}/{doc}/{attachment}

  // PUT /{db}/{design-doc-id}
  createDesignDoc(name: string, doc: Object) : Observable {
    let spec = {};
    return this._call(RequestMethod.PUT, [this.db, '_design', name], spec);
  }

  // GET /{db}/{design-doc-id}
  retrieveDesignDoc(name: string) : Observable {
    return this._call(RequestMethod.GET, [this.db, '_design', name]);
  }

  // PUT /{db}/{design-doc-id}
  updateDesignDoc(name: string, version: string, doc: Object) : Observable {
    let spec = {};
    return this._call(RequestMethod.PUT, [this.db, '_design', name], spec);
  }

  // DELETE /{db}/{design-doc-id}
  deleteDesignDoc(id: string, version:string) : Observable {
    let spec = {};
    return this._call(RequestMethod.DELETE, [this.db, '_design', name], spec);
  }

  // TODO design doc attachment methods
  // GET /{db}{design-doc-id}/{attachment}
  // PUT /{db}/{design-doc-id}/{attachment}
  // DELETE /{db}/{design-doc-id}/{attachment}


  // GET /{db}/{design-doc-id}/_view/{view-name}
  // POST /{db}/{design-doc-id}/_view/{view-name}
  view(doc: string, view: string, spec: Map<string, string>) : Observable {
    let spec = {};
    return this._call(RequestMethod.GET, [this.db, '_design', doc, '_view', view], spec);
    // return this._call(RequestMethod.POST, [this.db, '_design', doc, '_view', view], spec);
  }
}

