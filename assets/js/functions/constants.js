
const GLOBAL_VAR = (function () {
  let Repo = {
    countries: [], leagues: [], bets: [], tickets: []
  };

  return {
    set: ( prop, value ) => {
      switch (true) {
        case (prop === 'data') : { Repo = value; } break;
        case ( ! ObjectUtil.isEmpty(prop)) : { Repo[ prop ] = value; } break;
      }
    },
    append: ( prop, value ) => {
      if( ! Array.isArray(Repo[ prop ])) { throw new Error(`${prop} is not Array`); }
      Repo[ prop ].push(value);
    },
    update: ( prop, value, index ) => {
      if( ! Array.isArray(Repo[ prop ])) { throw new Error(`${prop} is not Array`); }
      Repo[ prop ][ index ] = value;
    },
    get: ( prop ) => {
      try {
        return typeof prop === 'undefined' ? Repo : Repo[ prop ];
      } catch (error) {
        return null;
      }
    }
  };
})();
