
const TicketHandler = (function () {

  const TicketHandlerObj = {
    params: {
      gamesPerSlip: 7, slips: 3, interval: 3,
    },
    ticket: {
      stake: 0, bookings: []
    },
    run( ticketId, type = '') {
      let dummy = [ [], [] ];

      if( ! type ) { return dummy; }

      let { gamesPerSlip, slips, interval } = TicketHandlerObj.params;

      // Find ticket with id ticketId
      let [ index, ticket ] = FormHandlers.getTicket( ticketId );

      if(ticket && ticket.id) {
        TicketHandlerObj.ticket = ticket;

        try {
          switch (type) {
            case 'PA' : {
              return TicketHandlerObj.getPartialAccumulation( gamesPerSlip, slips, interval );
            } break;
          }
        } catch (error) {
          console.log('getPartialAccumulation Error: ', error);
        }
      }

      return dummy;
    },
    getPartialAccumulation: ( gamesPerSlip, slips, interval ) => {
      let bookings = TicketHandlerObj.ticket.bookings;
      let totalCount = bookings.length;
      let groups = [];

      if(slips === 1 && gamesPerSlip === 0) {
        gamesPerSlip = totalCount;
      }

      let int = interval > gamesPerSlip, slp = slips > gamesPerSlip;
      let error, code;

      if(slips < 1 || gamesPerSlip < 0 || interval < 0) {
        error = 'Minimum values: [slips] = 1, [gamesPerSlip] = 0, [interval] = 0';
        code = 2;
        throw new Error(error, code);

      }else if(totalCount < gamesPerSlip) {
        error = `Supplied [gamesPerSlip] (${gamesPerSlip}) exceeds the available games (totalCount)`;
        code = 3;
        throw new Error(error, code);

      }else if( int || slp ) {
        let param = int ? `[interval] (${interval})` : `[slips] (${slips})`;
        error = `Supplied ${param} exceeds the supplied [gamesPerSlip] (${gamesPerSlip})`;
        code = 3;
        throw new Error(error, code);
      }

      for (let slipIndex = 0; slipIndex < slips; slipIndex++) {
        let name = String.fromCharCode( 65 + slipIndex );
        let firstOddIndex = slipIndex * interval;
        groups.push( name );

        let fromZero = 0;
        let groupCumulativeOdds = 1;

        let group = [];

        for (let offset = 0; offset < gamesPerSlip; offset++) {
          let currentPos = firstOddIndex + offset;
          let oddIndex = currentPos < totalCount ? currentPos : (fromZero++);

          groupCumulativeOdds *= bookings[ oddIndex ]['odd'];

          if( ! bookings[ oddIndex ].hasOwnProperty('groups') ) {
            bookings[ oddIndex ]['groups'] = {};
          }

          if( ! bookings[ oddIndex ]['groups'].hasOwnProperty(name) ) {
            bookings[ oddIndex ]['groups'][name] = {};
          }

          bookings[ oddIndex ]['groups'][name][ oddIndex + 1 ] = {
            odd_index: oddIndex,
            marker: (offset === 0) ? '[x]' : 'x',
            cumulative_odds: groupCumulativeOdds,
            cumulative_amount: groupCumulativeOdds * TicketHandlerObj.ticket.stake,
          };

          group[oddIndex + 1] = bookings[ oddIndex ]['groups'][name][ oddIndex + 1 ];
        }
      }

      if(bookings.length){
        let data = GLOBAL_VAR.get(), matches = data.matches, bets = data.bets;

        bookings = bookings.map( book => {
          book['match'] = matches.find( match => match.id === book.id_match);
          book['bet'] = bets.find( bet => bet.id === book.id_bet);
          return book;
        });

        GLOBAL_VAR.set('bookings', bookings);
      }

      return [bookings, groups];
    },
  };

  return TicketHandlerObj;

})();
