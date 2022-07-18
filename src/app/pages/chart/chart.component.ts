import { Component, OnInit } from '@angular/core';
import { ECharts, EChartsOption } from 'echarts';
import { Subscription } from 'rxjs';
import { range } from 'underscore';
import { SocketService } from 'src/app/services/socket.service';

const FREQUENCIES = ["0.8", "1", "1.25", "1.6", "2", "2.5", "3.15", "4", "5", "6.3","8","10","12.5","16","20","25","31.5","40","50","63","80","100","125","160","200","250","315","400","500","630","800","1k","1.25k","1.6k","2k","2.5k","3.15k","4k","5k","6.3k","8k","10k", "12.5k", "16k", "20k"]

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit {

  gaugeChartInstance: ECharts | any = null;
  gaugeChartOption: EChartsOption = {
    series: [
      {
        type: 'gauge',
        center: ['50%', '60%'],
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: 120,
        splitNumber: 12,
        itemStyle: {
          color: '#FFAB91'
        },
        progress: {
          show: true,
          width: 30
        },
        pointer: {
          show: false
        },
        axisLine: {
          lineStyle: {
            width: 30
          }
        },
        axisTick: {
          distance: -45,
          splitNumber: 5,
          lineStyle: {
            width: 2,
            color: '#999'
          }
        },
        splitLine: {
          distance: -52,
          length: 14,
          lineStyle: {
            width: 3,
            color: '#999'
          }
        },
        axisLabel: {
          distance: -20,
          color: '#999',
          fontSize: 20
        },
        anchor: {
          show: false
        },
        title: {
          show: false
        },
        detail: {
          valueAnimation: true,
          width: '60%',
          lineHeight: 40,
          borderRadius: 8,
          offsetCenter: [0, '-15%'],
          fontSize: 50,
          fontWeight: 'bolder',
          formatter: '{value} dB',
          color: 'inherit'
        },
        data: [
          {
            value: 0
          }
        ]
      }
    ]
  };

  barChartInstance: ECharts | any = null;
  barChartOption: EChartsOption = {
    title:  {
      text: "1/3 Octave Spectrum"
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      axisLabel: {
        interval: 0,
        rotate: 45,
      },
      name: 'Freq [Hz]',
      nameLocation: 'middle',
      nameGap: 50
    },
    yAxis: {
      type: 'value',
      name: 'Leq [dB]',
      nameRotate: 90,
      nameLocation: 'middle',
      nameGap: 40,
      min: 0,
      max: 100,
    },
    series: [
      {
        type: 'bar'
      },
      {
        type: 'bar'
      }
    ]
  };

  gaugeSubscription: Subscription | any = null;
  barSubscription: Subscription | any = null;
  
  lastLeqCh1: any;
  lastLeqCh2: any;

  freqs: number[] = [];
  minFreq: number = 0
  maxFreq: number = 44

  constructor(
    private socketService: SocketService
  ) { }

  ngOnInit(): void {
    // this.socketService.connect();
  }

  ngOnDestroy(): void {
    if (this.gaugeSubscription) {
      this.gaugeSubscription.unsubscribe()
    }
    if (this.barSubscription) {
      this.barSubscription.unsubscribe()
    }
  }

  onGaugeChartInit(event: any) {
    this.gaugeChartInstance = event;
    this.gaugeSubscription = this.socketService.leq.subscribe(e => {
      let channel = e.channel
      let data = e.data
      this.gaugeChartInstance.setOption({
        series: [
          {
            data: [
              {
                value: data.get(33)
              }
            ]
          }
        ]
      })
    })
  }

  onBarChartInit(event: any) {
    this.barChartInstance = event;
    this.barSubscription = this.socketService.leq.subscribe(e => {
      let channel = e.channel
      let data = e.data
      this.minFreq = Math.min(...this.freqs, ...data.keys());
      this.maxFreq = Math.max(...this.freqs, ...data.keys());
      this.freqs = range(this.minFreq, this.maxFreq + 1);
      if (channel == 1) {
        this.lastLeqCh1 = this.freqs.map(f => data.get(f))
      } else {
        this.lastLeqCh2 = this.freqs.map(f => data.get(f))
      }
      this.updateBarCharts();
    })
  }

  updateBarCharts() {
    this.barChartInstance.setOption({
      xAxis: {
        data: this.freqs.map(k => FREQUENCIES[k])
      },
      series: [
        {
          data: this.lastLeqCh1
        },
        {
          data: this.lastLeqCh2
        }
      ]
    })
  }

}
