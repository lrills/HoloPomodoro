import React from 'react';
import AppFrame from '../components/AppFrame';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import Paper from '@mui/material/Paper';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { XYPlot, VerticalBarSeries, XAxis, YAxis } from 'react-vis';
import { ViewState } from '@devexpress/dx-react-scheduler';
import {
  Scheduler,
  DayView,
  Appointments,
} from '@devexpress/dx-react-scheduler-material-ui';
import ordinal from 'ordinal';
import { PanelPageProps } from '../types';
import getVtuber from '../utils/getVtuber';

const StatisticsPanel = ({ appData }: PanelPageProps) => {
  const [chartWidth, setChartWidth] = React.useState(300);
  const chartPaperRef = React.useCallback((node) => {
    if (node !== null) {
      setChartWidth(node.getBoundingClientRect().width);
    }
  }, []);

  let todayCount = '-';
  let remainingCount = '-';
  let recentAvgCount = '-';
  let recentDaysCount = '-';
  let finishRate = '-';

  let schedulerData;
  let scheduleStartHour = 0;
  let scheduleEndHour = 2;
  let barChartData: { x: string; y: number }[] = [];

  const vtuber = getVtuber(appData?.settings.oshi);
  const pomodoroIcon = vtuber?.pomodoroIcon || '🍅';
  const vtuberColor = vtuber?.color.primary || 'red';

  if (appData) {
    const {
      settings,
      statistics: { records, recentCounts },
    } = appData;

    todayCount = records.length.toString();
    remainingCount = (settings.pomodoroPerDay - records.length).toString();

    schedulerData = records.map(([startDate, endDate], i) => ({
      startDate,
      endDate,
      title: `${ordinal(i + 1)} ${pomodoroIcon}`,
    }));
    scheduleStartHour = records[0]?.[0].getHours() || 0;
    scheduleEndHour = (records[records.length - 1]?.[1].getHours() || 1) + 1;

    if (recentCounts.length > 0) {
      const recentSum = recentCounts.reduce((sum, [, count]) => sum + count, 0);
      const recentDays = recentCounts.length;

      recentDaysCount = recentDays.toString();
      recentAvgCount = (recentSum / recentDays).toFixed(1);
      finishRate = (
        (recentSum * 100) /
        (recentDays * settings.pomodoroPerDay)
      ).toFixed();
    }

    barChartData = recentCounts.map(([day, count]) => ({
      x: day.split('-', 3).slice(1).join('/'),
      y: count,
    }));
  }

  return (
    <AppFrame
      oshi={appData?.settings.oshi}
      title="Statistics"
      userProfile={appData?.userProfile}
      isProcessing={!appData}
    >
      <Container maxWidth="md" style={{ padding: '20px' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h4" component="div">
                  Today's {pomodoroIcon}
                </Typography>
                <Typography variant="h2" component="div">
                  {todayCount}
                </Typography>
                <Typography color="text.secondary">
                  <b>{remainingCount}</b> remaining...
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h4" component="div">
                  Avg. {pomodoroIcon}
                </Typography>
                <Typography variant="h2" component="div">
                  {recentAvgCount}
                </Typography>
                <Typography color="text.secondary">
                  for last <b>{recentDaysCount}</b> days
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h4" component="div">
                  Finish Rate
                </Typography>
                <Typography variant="h2" component="div">
                  {finishRate} %
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <Scheduler data={schedulerData}>
                <ViewState currentDate={appData?.statistics.day} />
                <DayView
                  displayName="schedule"
                  startDayHour={scheduleStartHour}
                  endDayHour={scheduleEndHour}
                  cellDuration={60}
                />
                <Appointments
                  appointmentComponent={({
                    children,
                    ...restProps
                  }: Appointments.AppointmentProps) => (
                    <Appointments.Appointment
                      {...restProps}
                      style={{ backgroundColor: vtuberColor }}
                    >
                      {children}
                    </Appointments.Appointment>
                  )}
                />
              </Scheduler>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper ref={chartPaperRef}>
              <XYPlot width={chartWidth} height={300} xType="ordinal">
                <XAxis tickLabelAngle={-45} tickSize={3} />
                <YAxis />
                <VerticalBarSeries data={barChartData} color={vtuberColor} />
              </XYPlot>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </AppFrame>
  );
};

export default StatisticsPanel;
