if (!me) cancel('primero debe iniciar sesion', 401);

protect('title');
protect('creator');
protect('created');
protect('modifiedBy');
protect('lastUpdated');

this.lastUpdated = new Date();
this.modifiedBy = me.id;

emit('todos:changed', this.modifiedBy);