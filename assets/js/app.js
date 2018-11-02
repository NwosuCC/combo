
$.ajaxSetup({
  //    context: '', // specifies the 'this' value for the callback functions
  beforeSend: (xhr) => { console.log('beforeSend...'); },
  //    username: '',  // for HTTP access authentication request.
  //    password: '',  // for HTTP access authentication request.
  //    timeout: 0,
  url: "index.php",
  dataType: 'json', // 'script', 'json',
  // contentType: 'application/json',
  type: "GET",
  data: "data='all'",
  // data: $.param( formValues ),
//    ifModified: true, // default: false. If true, request is only successful if the response has changed since the last request
  error: function (xhr,status,error) {
    console.log('ajax error: ', error, '\n status: ', xhr);
  },
  complete: function (xhr,status) {

  }
});

const SupplementaryData = (function() {
  return {
    years: (() => {
      let years = [], currentYear = (new Date()).getFullYear();
      for(let n = 9; n >= 0; n-- ){ years.push( currentYear - n ); }
      return years;
    })()
  }
})();

const updateModelRelations = (data) => {
  if(data.hasOwnProperty('countries') && data.hasOwnProperty('leagues')){
    let countries = data.countries, leagues = data.leagues;

    data.leagues = leagues.map( league => {
      league.country = countries.find( ctr => ctr.id === league.id_country);
      return league;
    });

    if(data.hasOwnProperty('clubs')){
      let clubs = data.clubs;

      data.clubs = clubs.map( club => {
        club.league = leagues.find( lg => lg.id === club.id_league);
        return club;
      });

      if(data.hasOwnProperty('matches')){
        let matches = data.matches;

        data.matches = matches.map( match => {
          match.club_1 = clubs.find( cl => cl.id === match.id_club_1);
          match.club_2 = clubs.find( cl => cl.id === match.id_club_2);
          match.league = leagues.find( lg => lg.id === match.id_league);
          return match;
        });
      }
    }

    if(data.hasOwnProperty('bookings')){
      data.tickets = data.bookings.map( book => Array.isArray(book) && book.length ? book[0].ticket : '').filter(b => !!b);
      data.savedTickets = data.tickets.concat([]);
    }

    return data;
  }


  return [];
};


$.ajax({
  contentType: 'application/json',
  success: function(result, status, xhr){
    result = updateModelRelations( result );

    result = { ...SupplementaryData, ...result };

    console.log('Data: ', result);

    GLOBAL_VAR.set( 'data', result);

    xnTPL()
      .pipes( StringUtil )
      .init({
        data_1: GLOBAL_VAR.get(), data_2: { org: { test: true } }
      });
  },
});


$(document).ready(function () {

  const showHideClass = '.x-hide, .x-show';

  $(document).find('.x-hide').hide();
  $(document).find('.x-show').show();

  $(document)
    .on({
      click() { FormHandlers.submit( $(this) ) }
    }, '.submit-btn')
    .on({
      change() {
        // let desc = $(this).data('ctrlg'), childElem = $('#'+desc), elem = $(this);
        let elem = $(this), childElem = $('[data-lgctr]');
        FormHandlers.showCountryLeagues( elem, childElem ) ;
        $('[data-clblg]').val('');
      }
    }, '[data-ctrlg]')
    .on({
      change() {
        // let asc = $(this).data('lgctr'), parentElem = $('#'+asc), elem = $(this);
        let elem = $(this), parentElem = $('[data-ctrlg]');
        FormHandlers.setLeagueCountry( elem, parentElem ) ;
      }
    }, '[data-lgctr]')
    .on({
      change() {
        // let desc = $(this).data('lgclb'), childElem = $('#'+desc), elem = $(this);
        let elem = $(this), childElem = $('[data-clblg]');
        // console.log('elem: ', elem, ' | childElem: ', childElem);
        FormHandlers.showLeagueClubs( elem, childElem ) ;
      }
    }, '[data-lgclb]')
    .on({
      change() {
        // let asc = $(this).data('clblg'), parentElem = $('#'+asc), elem = $(this);
        let elem = $(this), parentElem = $('[data-lgclb]');
        FormHandlers.setClubLeague( elem, parentElem ) ;
      }
    }, '[data-clblg]')
    .on({
      change() {
        $(this).val(function () { return StringUtil.asNumber( $(this).val() ); });
      }
    }, '.input-number')
    .on({
      focus() {
        if( $(this).val() ) {
          $(this).val(function () { return StringUtil.withOptionalDecimal( $(this).val() ); });
        }
      },
      blur() {
        $(this).val(function () { return StringUtil.asCurrency( $(this).val() ); });
      },
    }, '.input-currency')
   .on({
      change() {
        FormHandlers.reloadMatches( $('.select-matches') ) ;
      }
    }, '.select-matches')
    /*.on({
      change() {
        if( $(this).val() === '_' ) {
          let addOption = $(this).find('option[value="_"]'), addType = addOption.data('add');
          console.log('addType: ', addType);  // instead, go to page or load form partial
          if(addType){ $(`#${addType}Form`).show(); /!*$('#formModal').modal('show');*!/ }
        }
      }
    }, '.select-search')*/
    .on({
      click() {
        let addBtn = $(this).hasClass('add-btn'), okBtn = $(this).hasClass('ok-btn'), xBtn = $(this).hasClass('x-btn');

        let target = $(this).data('target'), targetElem = $(`#${target}`);
        let alt = targetElem.data('alt'), altElem = $(`#${alt}`);
        let result = true, value = '';

        if(target && targetElem && alt && altElem) {
          if(okBtn) {
            value = targetElem.val();
            switch ( target ) {
              case 'new_ticket' : { result = FormHandlers.addNewTicket( altElem, value ); } break;
            }
          }

          if(result) {
            if(addBtn) {
              targetElem.val('').parents(showHideClass).show();
              altElem.parents(showHideClass).hide();
            }else{
              targetElem.val('').parents(showHideClass).hide();
              altElem.val(value).trigger('change').parents(showHideClass).show();
              if(okBtn) { FormHandlers.addTempBooking(); }
            }
          }
        }
      }
    }, '.add-btn, .ok-btn, .x-btn')
    .on({
      change() {
        let ticket = $(this).val(), savedTickets = GLOBAL_VAR.get('savedTickets');
        let saveBtn = $('#saveBooking'), spanNew = saveBtn.find('span.x-show'), spanUpdate = saveBtn.find('span.x-hide');

        if( ticket ) { FormHandlers.displayTicket( ticket ); }

        if( ticket && savedTickets.includes( ticket ) ) {
          spanNew.hide(); spanUpdate.show();
        }else{
          spanNew.show(); spanUpdate.hide();
        }
      }
    }, '#booking_ticket')
    .on({
      change() {
        if( $(this).attr('id') === 'booking_ticket' ) { return; }
        FormHandlers.addTempBooking();
      }
    }, '#bookingForm input, #bookingForm select')
  ;


  /*
  // click() { $('#b').html( 'dsfsff'.bold() ); },

  // console.log('options elem: ', $('.select-search option:eq(1)').length );

  const CLS = {
    group: 'search-input-group', input: 'search-input', option: 'select-search option',
    get: (name) => CLS.hasOwnProperty(name) ? '.'+CLS[ name ] : ''
  };

  const searchInput = () => $('<input/>').attr({'class': CLS.input }).css({'width': '100%'});
  const searchInputGroup = () => $('<div/>').attr({'class': CLS.group }).html( searchInput() );

  $(document)
    .on({
      mousedown() {
        let className = CLS.get('group');
        if( ! $(this).siblings( className ).length ) {
          $(this).before( searchInputGroup().css({'width': $(this).css('width')}) );
        }
        $(this).prev( className ).removeClass('d-none').focus();

        $(this).on({
          mouseout() {
            // $(this).prev( className ).addClass('d-none').focus();
            console.log('select-search val: ', $(this).find('option:eq(1)').text() );
          },
          keydown() {
            console.log('select-search keydown: ', $(this).append( $(this).find('option:eq(1)') ) );
          },
        })
      },
    }, '.select-search')
    .on({
      click(){
        console.log('option text: ', $(this).text() );
        $( CLS.get('group') ).addClass('d-none');
      },
    }, '.select-search option:eq(1)')
    .on({
      blur(){ $(this).addClass('d-none'); },
    }, CLS.get('group') );*/

});
