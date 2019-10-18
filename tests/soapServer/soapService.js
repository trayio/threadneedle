module.exports = {
	'RegOnline_x0020_API': {
		'RegOnline_x0020_APISoap': {
			GetEvents: function (args) {
				console.log(args);
				return {
					GetEventsResult: {
						Success: true,
						Data: {
							APIEvent: [
								{
									ID: 1905375,
									CustomerID: 457098,
									ParentID: 0,
									Status: 'Testing',
									Title: 'test 2',
									StartDate: '2016 - 11 - 22 T00: 00: 00.000 Z',
									EndDate: '2016 - 11 - 24 T00: 00: 00.000 Z',
									ClientEventID: '',
									TypeID: 1,
									City: '',
									State: '',
									Country: '',
									CountryCode: '',
									PostalCode: '',
									LocationName: '',
									LocationRoom: '',
									LocationPhone: '',
									LocationBuilding: '',
									LocationAddress1: '',
									LocationAddress2: '',
									TimeZone: 'Mountain Time',
									CurrencyCode: 'USD',
									Keywords: '',
									AddDate: '2016 - 11 - 14 T08: 50: 46.283 Z',
									AddBy: 'traydev',
									ModDate: '2016 - 11 - 16 T06: 56: 55.960 Z',
									ModBy: 'traydev',
									Channel: '',
									IsWaitlisted: false,
									Culture: 'English (United States)',
									MediaType: '',
									IsActive: false,
									IsOnSite: false,
									InternalNotes: ''
								},
								{
									ID: 1904543,
									CustomerID: 457098,
									ParentID: 0,
									Status: 'Testing',
									Title: 'My test event',
									StartDate: '2016 - 11 - 24 T08: 00: 00.000 Z',
									EndDate: '2016 - 11 - 24 T08: 00: 00.000 Z',
									ClientEventID: '',
									TypeID: 1,
									City: '',
									State: '',
									Country: '',
									CountryCode: '',
									PostalCode: '',
									LocationName: '',
									LocationRoom: '',
									LocationPhone: '',
									LocationBuilding: '',
									LocationAddress1: '',
									LocationAddress2: '',
									TimeZone: 'Mountain Time',
									CurrencyCode: 'USD',
									Keywords: '',
									AddDate: '2016 - 11 - 09 T19: 35: 18.480 Z',
									AddBy: 'traydev',
									ModDate: '2016 - 11 - 15 T12: 27: 20.470 Z',
									ModBy: 'traydev',
									Channel: '',
									IsWaitlisted: false,
									Culture: 'English (United States)',
									MediaType: '',
									IsActive: false,
									IsOnSite: false,
									InternalNotes: ''
								}
							]
						},
						StatusCode: 0,
						Authority: 0
					}
				};
			}
		}
	}
};
