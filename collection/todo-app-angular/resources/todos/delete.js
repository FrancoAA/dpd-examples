if (!me || this.creator !== me.id) cancel('no tiene autorizacion para borrar el objeto', 401);

emit('todos:changed', me.id);