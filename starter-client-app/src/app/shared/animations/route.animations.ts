import {
	trigger,
	animate,
	style,
	transition,
  query,
  animateChild,
  group,
  stagger
} from '@angular/animations';

export const routeAnimations =
  trigger('routeAnimations', [
    /*transition('RuoliPage <=> UtentiPage', [
      style({ position: 'relative' }),
      query(':enter, :leave', [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%'
        })
      ]),
      query(':enter', [
        style({ left: '-100%'})
      ]),
      query(':leave', animateChild()),
      group([
        query(':leave', [
          animate('3s ease-out', style({ left: '100%'}))
        ]),
        query(':enter', [
          animate('3s ease-out', style({ left: '0%'}))
        ])
      ]),
      query(':enter', animateChild()),
    ]),*/
    /*transition('* <=> UtentiPage', [
      style({ position: 'relative' }),
      query(':enter, :leave', [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%'
        })
      ]),
      query(':enter', [
        style({ left: '-100%'})
      ]),
      query(':leave', animateChild()),
      group([
        query(':leave', [
          animate('200ms ease-out', style({ left: '100%'}))
        ]),
        query(':enter', [
          animate('300ms ease-out', style({ left: '0%'}))
        ])
      ]),
      query(':enter', animateChild()),
    ])*/
    /*transition('* <=> *', [
      // order
      // 1
       query(':enter, :leave', style({ position: 'fixed', width:'100%' })
        , { optional: true }),
      // 2
      group([  // block executes in parallel
        query(':enter', [
          style({ transform: 'translateX(100%)' }),
          animate('0.5s ease-in-out', style({ transform: 'translateX(0%)' }))
        ], { optional: true }),
        query(':leave', [
          style({ transform: 'translateX(0%)' }),
          animate('0.5s ease-in-out', style({ transform: 'translateX(-100%)' }))
        ], { optional: true }),
      ])
    ]),*/
    /*transition('* <=> *', [
      // order 
      // 1 
      query(':enter, :leave', style({ position: 'fixed', width:'100%' })
        , { optional: true }),
      // 2 
      query('.block', style({ opacity: 0 }), { optional: true }),
      // 3 
      group([  // block executes in parallel
        query(':enter', [
          style({ transform: 'translateX(100%)' }),
          animate('0.5s ease-in-out', style({ transform: 'translateX(0%)' }))
        ], { optional: true }),
        query(':leave', [
          style({ transform: 'translateX(0%)' }),
          animate('0.5s ease-in-out', style({ transform: 'translateX(-100%)' }))
        ], { optional: true }),
        // 4
        query(':enter .block', stagger(400, [
          style({ transform: 'translateY(100px)' }),
          animate('1s ease-in-out', 
            style({ transform: 'translateY(0px)', opacity: 1 })),
        ]),{ optional: true }),
      ])
    ])*/
    transition('* <=> *', [
      group([
        
        query(':enter .block', stagger(400, [
          style({ transform: 'translateY(100px)', opacity: 0 }),
          animate('1s ease-in-out', 
            style({ transform: 'translateY(0px)', opacity: 1 })),
        ]),{ optional: true }),
        query(':enter .block-h', stagger(200,[
          style({ transform: 'translateX(100px)', opacity: 0 }),
          animate('1s ease-in-out', 
            style({ transform: 'translateX(0px)', opacity: 1})),
        ]),{ optional: true }),
      ])
      
      
    ])
  ]);